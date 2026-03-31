import { memo, useCallback, useState, useMemo, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui-kit/button';
import { Label } from '@/components/ui-kit/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui-kit/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui-kit/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui-kit/avatar';
import { Assignee } from '../../types/task-manager.types';

/**
 * AssigneeSelector Component
 *
 * A reusable component for selecting and managing task assignees.
 * This component allows users to:
 * - View selected assignees with avatars
 * - Add or remove assignees from a list of available members
 * - Search for members using a search input
 *
 * Features:
 * - Displays up to 3 selected assignees with avatars
 * - Shows a "+X" badge for additional assignees beyond the first 3
 * - Provides a searchable dropdown for selecting or deselecting assignees
 * - Uses a popover for a compact and user-friendly UI
 *
 * Props:
 * @param {Assignee[]} availableAssignees - The list of all available assignees
 * @param {Assignee[]} selectedAssignees - The list of currently selected assignees
 * @param {(selected: Assignee[]) => void} onChange - Callback triggered when the selected assignees change
 *
 * @example
 * // Basic usage
 * <AssigneeSelector
 *   availableAssignees={allMembers}
 *   selectedAssignees={taskAssignees}
 *   onChange={(updatedAssignees) => setTaskAssignees(updatedAssignees)}
 * />
 */

interface AssigneeSelectorProps {
  availableAssignees: Assignee[];
  selectedAssignees: Assignee[];
  onChange: (assignees: Assignee[]) => void;
  isEditMode?: boolean;
}

const AssigneeSelectorComponent = ({
  availableAssignees,
  selectedAssignees,
  onChange,
  isEditMode = false,
}: Readonly<AssigneeSelectorProps>) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedAssignees.map((a) => a.ItemId))
  );

  useEffect(() => {
    const newIds = new Set(selectedAssignees.map((a) => a.ItemId));
    setSelectedIds((prev) => {
      if (
        prev.size !== newIds.size ||
        Array.from(prev).some((id) => !newIds.has(id)) ||
        Array.from(newIds).some((id) => !prev.has(id))
      ) {
        return newIds;
      }
      return prev;
    });
  }, [selectedAssignees]);

  const memoizedAvailableAssignees = useMemo(
    () =>
      availableAssignees.map((assignee) => ({
        ...assignee,
        isSelected: selectedIds.has(assignee.ItemId),
        isProcessing: isProcessing[assignee.ItemId] || false,
      })),
    [availableAssignees, selectedIds, isProcessing]
  );

  const handleSelect = useCallback(
    (assignee: Assignee) => {
      const assigneeId = assignee.ItemId;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(assigneeId)) {
          newSet.delete(assigneeId);
        } else {
          newSet.add(assigneeId);
        }

        const newAssignees = availableAssignees
          .filter((a) => (a.ItemId === assigneeId ? newSet.has(assigneeId) : newSet.has(a.ItemId)))
          .map(({ ItemId, Name, ImageUrl }) => ({ ItemId, Name, ImageUrl: ImageUrl || '' }));

        onChange(newAssignees);

        return newSet;
      });

      if (isEditMode) {
        setIsProcessing((prev) => ({ ...prev, [assigneeId]: true }));

        const timer = setTimeout(() => {
          setIsProcessing((prev) => ({ ...prev, [assigneeId]: false }));
        }, 500);

        return () => clearTimeout(timer);
      }
    },
    [availableAssignees, onChange, isEditMode]
  );

  return (
    <div>
      <Label className="text-high-emphasis text-base font-semibold">{t('ASSIGNEE')}</Label>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex -space-x-2">
          {selectedAssignees.slice(0, 3).map((assignee) => (
            <Avatar key={assignee.ItemId} className="h-8 w-8 border-2 border-background">
              <AvatarImage src={assignee.ImageUrl} alt={assignee.Name} />
              <AvatarFallback className="bg-neutral-200 text-foreground text-xs">
                {assignee.Name.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          ))}
          {selectedAssignees.length > 3 && (
            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-gray-600 border-2 border-background">
              +{selectedAssignees.length - 3}
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-7 w-7 border-dashed">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-0 w-[240px]" align="start" sideOffset={4}>
            <Command>
              <CommandInput placeholder={t('SEARCH_MEMBERS')} className="h-9" />
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty className="py-2 px-3 text-sm">{t('NO_MEMBERS_FOUND')}</CommandEmpty>
                <CommandGroup>
                  {memoizedAvailableAssignees.map((assignee) => (
                    <CommandItem
                      key={assignee.ItemId}
                      value={assignee.ItemId}
                      onSelect={() => handleSelect(assignee)}
                      className="flex items-center px-2 py-1.5 cursor-pointer"
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded border',
                          assignee.isSelected && !assignee.isProcessing
                            ? 'bg-primary border-primary'
                            : 'border-border',
                          assignee.isProcessing ? 'opacity-50' : ''
                        )}
                        aria-hidden="true"
                      >
                        {assignee.isSelected && !assignee.isProcessing && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                        {assignee.isProcessing && (
                          <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={assignee.ImageUrl} alt={assignee.Name} />
                        <AvatarFallback className="bg-neutral-200 text-foreground text-xs">
                          {assignee.Name.split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignee.Name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export const AssigneeSelector = memo(AssigneeSelectorComponent);
