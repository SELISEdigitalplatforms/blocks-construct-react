import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui-kit/button';
import { ChevronDown, PenLine } from 'lucide-react';
import { Label } from '@/components/ui-kit/label';
import { useTaskDetails } from '../../hooks/use-task-details';

/**
 * EditableDescription Component
 *
 * A reusable component for displaying and editing task descriptions.
 * This component supports:
 * - Inline editing of descriptions with a rich text editor
 * - Saving or canceling changes
 * - Automatically focusing the editor when editing starts
 * - Showing or hiding additional lines of content
 *
 * Features:
 * - Allows users to edit descriptions inline
 * - Dynamically loads a custom text editor to reduce initial bundle size
 * - Saves changes on button click
 * - Cancels editing and reverts to the original description
 * - Displays a "Show More" or "Show Less" button for long descriptions
 *
 * Props:
 * @param {string} [taskId] - The ID of the task associated with the description
 * @param {string} [initialContent] - The initial content of the description
 * @param {(content: string) => void} [onContentChange] - Callback triggered when the description is saved
 *
 * @example
 * // Basic usage
 * <EditableDescription
 *   taskId="123"
 *   initialContent="This is a task description."
 *   onContentChange={(newContent) => console.log('Saved description:', newContent)}
 * />
 */

export interface EditableDescriptionRef {
  focus: () => void;
}

interface EditableDescriptionProps {
  taskId?: string;
  initialContent: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  isNewTask?: boolean;
}

type EditorComponentType = React.ComponentType<any> | null;

const EditableDescription = forwardRef<EditableDescriptionRef, EditableDescriptionProps>(
  ({ taskId, initialContent, onContentChange, onSave, isNewTask = false }, ref) => {
    const { task, updateTaskDetails } = useTaskDetails(taskId);
    const [content, setContent] = useState(initialContent);
    const [isEditing, setIsEditing] = useState(isNewTask);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [editorComponent, setEditorComponent] = useState<EditorComponentType>(null);
    const { t } = useTranslation();
    const [forceRender, setForceRender] = useState(0);

    useEffect(() => {
      if (initialContent && !content) {
        setContent(initialContent);
        if (!isNewTask) {
          setIsEditing(false);
        }
      } else if (!isEditing) {
        setContent(initialContent);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialContent, isNewTask]);

    useEffect(() => {
      setIsMounted(true);

      if (isEditing) {
        import('../../../../components/core/custom-text-editor/custom-text-editor')
          .then(({ CustomTextEditor }) => {
            setEditorComponent(() => CustomTextEditor as React.ComponentType<any>);
          })
          .catch((error) => {
            console.error('Error loading editor:', error);
          });
      }
    }, [isEditing]);

    const handleContentChange = useCallback(
      (newContent: string) => {
        setContent(newContent);
        if (onContentChange) {
          onContentChange(newContent);
        }
      },
      [onContentChange]
    );

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorContainerRef.current) {
          const editor = editorContainerRef.current.querySelector(
            '[contenteditable="true"]'
          ) as HTMLElement;
          if (editor) {
            editor.focus();
          }
        }
      },
    }));

    const cleanupEditorInstances = () => {
      const editorContainers = document.querySelectorAll('.ql-container');
      editorContainers.forEach((container) => {
        const editorRoot = container.closest('.editor-root');
        if (editorRoot?.parentNode) {
          const contentContainer = document.createElement('div');
          contentContainer.innerHTML = container.innerHTML;
          const parentNode = editorRoot.parentNode as Node;
          parentNode.replaceChild(contentContainer, editorRoot);
        }
      });
    };

    const handleSave = async () => {
      try {
        if (onSave) {
          await onSave(content);
        } else if (onContentChange) {
          onContentChange(content);
        } else if (task) {
          await updateTaskDetails({ Description: content });
        }
        setIsEditing(false);
        setForceRender((prev) => prev + 1);
      } catch (error) {
        console.error('Error saving description:', error);
      }
    };

    const handleCancel = () => {
      setContent(initialContent);
      setIsEditing(false);
      setForceRender((prev) => prev + 1);
    };

    const [showMore, setShowMore] = useState(false);
    const [hasMoreLines, setHasMoreLines] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const checkLines = () => {
        if (contentRef.current) {
          const lineHeight = parseInt(window.getComputedStyle(contentRef.current).lineHeight) || 20;
          const height = contentRef.current.scrollHeight;
          const lineCount = Math.ceil(height / lineHeight);

          setHasMoreLines(lineCount > 5);
        }
      };

      checkLines();

      window.addEventListener('resize', checkLines);
      window.addEventListener('load', checkLines);

      return () => {
        window.removeEventListener('resize', checkLines);
        window.removeEventListener('load', checkLines);
      };
    }, [content]);

    const renderContent = () => {
      if (!content) return null;

      return (
        <div className="relative">
          <div
            ref={contentRef}
            className="ql-editor text-sm formatted-content"
            style={{
              maxHeight: !showMore && hasMoreLines ? '7.5em' : 'none',
              overflow: !showMore && hasMoreLines ? 'hidden' : 'visible',
              padding: '0',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {hasMoreLines && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-sm font-semibold border"
              onClick={() => setShowMore(!showMore)}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`}
              />
              {showMore ? t('SHOW_LESS') : t('SHOW_MORE')}
            </Button>
          )}
        </div>
      );
    };

    useEffect(() => {
      const cleanup = () => {
        const existingStyle = document.getElementById('hide-quill-toolbar');
        if (existingStyle?.parentNode) {
          existingStyle.parentNode.removeChild(existingStyle);
        }

        if (!isEditing) {
          cleanupEditorInstances();
        }
      };

      return cleanup;
    }, [isEditing]);

    const renderEditorContent = () => {
      if (!isMounted) {
        return <div className="border rounded-md p-4">{t('LOADING_EDITOR')}</div>;
      }

      if (!editorComponent) {
        import('../../../../components/core/custom-text-editor/custom-text-editor')
          .then(({ CustomTextEditor }) => {
            setEditorComponent(() => CustomTextEditor as React.ComponentType<any>);
          })
          .catch(console.error);
        return <div className="border rounded-md p-4">{t('LOADING_EDITOR')}</div>;
      }

      const EditorComponent = editorComponent;
      return (
        <div className="relative">
          <div className="editor-root" key={`editor-container-${forceRender}`}>
            <EditorComponent
              key={`editor-instance-${forceRender}`}
              value={content}
              onChange={(newContent: string) => {
                setContent(newContent);
                handleContentChange(newContent);
              }}
              showIcons={false}
              autoFocus
            />
          </div>
          <div className="flex justify-end mt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-sm font-semibold border"
                onClick={handleCancel}
              >
                {t('CANCEL')}
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="text-sm font-semibold ml-2"
                onClick={handleSave}
              >
                {t('SAVE')}
              </Button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div
        ref={editorContainerRef}
        className={`relative rounded-md ${isHovering && 'bg-white'} ${isEditing && 'border-none'}`}
        onMouseEnter={() => !isEditing && setIsHovering(true)}
        onMouseLeave={() => !isEditing && setIsHovering(false)}
        aria-label={t('TASK_DESCRIPTION')}
        tabIndex={0}
      >
        <div className="flex items-center gap-1 h-9">
          <Label className="text-high-emphasis text-base font-semibold">{t('DESCRIPTION')}</Label>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditing(true);
            }}
            aria-label={t('EDIT_DESCRIPTION')}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              isEditing ? 'invisible' : 'hover:bg-accent hover:text-accent-foreground'
            } h-9 w-9`}
          >
            <PenLine className="h-4 w-4 text-primary" />
          </button>
        </div>

        {isEditing ? renderEditorContent() : <div className="text-sm">{renderContent()}</div>}
      </div>
    );
  }
);

EditableDescription.displayName = 'EditableDescription';

export { EditableDescription };
