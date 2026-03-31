import { useState } from 'react';
import { Paperclip, Star, SquarePen } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-kit/tabs';
import { TEmail } from '../../types/email.types';
import { Checkbox } from '@/components/ui-kit/checkbox';
import { Label } from '@/components/ui-kit/label';
import { Button } from '@/components/ui-kit/button';
import { htmlToPlainText } from '../../utils/email-utils';
import { CustomPaginationEmail } from '@/components/core';

/**
 * EmailList Component
 *
 * A reusable component for displaying a list of emails with filtering, pagination, and selection capabilities.
 * This component supports:
 * - Filtering emails by "All" or "Unread"
 * - Selecting individual or all emails for bulk actions
 * - Paginating the email list
 * - Displaying email details such as sender, subject, preview, and metadata (e.g., attachments, starred status)
 *
 * Features:
 * - Responsive design for both desktop and mobile views
 * - Supports bulk selection and filtering
 * - Pagination for managing large email lists
 *
 * Props:
 * @param {(email: TEmail | null) => void} onSelectEmail - Callback triggered when an email is selected
 * @param {TEmail | null} selectedEmail - The currently selected email
 * @param {TEmail[]} emails - The list of emails to display
 * @param {React.Dispatch<React.SetStateAction<Record<string, TEmail[]>>>} setEmails - State setter for updating email data
 * @param {string} category - The current email category (e.g., inbox, sent)
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsAllSelected - State setter for bulk selection
 * @param {React.Dispatch<React.SetStateAction<string[]>>} setCheckedEmailIds - State setter for selected email IDs
 * @param {string[]} checkedEmailIds - The list of selected email IDs
 * @param {() => void} handleComposeEmail - Callback triggered to open the compose email modal
 * @param {(email: TEmail) => void} handleEmailSelection - Callback triggered when an email is clicked
 *
 * @example
 * // Basic usage
 * <EmailList
 *   onSelectEmail={(email) => console.log(email)}
 *   selectedEmail={null}
 *   emails={emailData}
 *   setEmails={setEmails}
 *   category="inbox"
 *   setIsAllSelected={setIsAllSelected}
 *   setCheckedEmailIds={setCheckedEmailIds}
 *   checkedEmailIds={[]}
 *   handleComposeEmail={() => console.log('Compose Email')}
 *   handleEmailSelection={(email) => console.log('Selected Email:', email)}
 * />
 */

interface EmailListProps {
  onSelectEmail: (email: TEmail | null) => void;
  selectedEmail: TEmail | null;
  emails: TEmail[];
  setEmails: React.Dispatch<React.SetStateAction<Record<string, TEmail[]>>>;
  category: string;
  setIsAllSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckedEmailIds: React.Dispatch<React.SetStateAction<string[]>>;
  checkedEmailIds: string[];
  handleComposeEmail: () => void;
  handleEmailSelection: (email: TEmail) => void;
}

export const EmailList = ({
  selectedEmail,
  emails,
  setIsAllSelected,
  setCheckedEmailIds,
  checkedEmailIds,
  handleComposeEmail,
  handleEmailSelection,
}: Readonly<EmailListProps>) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredEmails = filter === 'unread' ? emails.filter((email) => !email.isRead) : emails;
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatReceivedDate = (dateString: string) => format(parseISO(dateString), 'dd.MM.yy');

  const isAllChecked =
    paginatedEmails.length > 0 &&
    paginatedEmails.every((email) => checkedEmailIds.includes(email.id));

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const newIds = paginatedEmails
        .map((email) => email.id)
        .filter((id) => !checkedEmailIds.includes(id));
      setCheckedEmailIds((prev) => [...prev, ...newIds]);
    } else {
      const paginatedIds = paginatedEmails.map((email) => email.id);
      setCheckedEmailIds((prev) => prev.filter((id) => !paginatedIds.includes(id)));
    }
    setIsAllSelected(checked);
  };

  const handleSingleEmailCheck = (emailId: string, checked: boolean) => {
    setCheckedEmailIds((prev) =>
      checked ? [...prev, emailId] : prev.filter((id) => id !== emailId)
    );
  };

  const handleFilterChange = (value: 'all' | 'unread') => {
    setFilter(value);
  };

  return (
    <>
      {/* Grid view */}
      <Tabs
        defaultValue="all"
        className="hidden  md:flex min-w-[307px] h-[calc(100vh-130px)] flex-col gap-3"
      >
        <div className="flex items-center  justify-between px-4 py-3 gap-4 border-b">
          <div className="flex items-center space-x-2 ">
            <Checkbox
              id="select-all"
              checked={isAllChecked}
              className="border-medium-emphasis data-[state=checked]:border-none border-2 rounded-[2px]"
              onCheckedChange={(checked) => handleSelectAllChange(!!checked)}
            />

            <Label className="text-sm font-medium ">{t('SELECT_ALL')}</Label>
          </div>
          <TabsList className="grid grid-cols-2 rounded-md min-w-[124px] text-sm p-1 bg-surface">
            <TabsTrigger
              className="[&[data-state=active]]:bg-white rounded"
              value="all"
              onClick={() => handleFilterChange('all')}
            >
              {t('ALL')}
            </TabsTrigger>
            <TabsTrigger
              className="[&[data-state=active]]:bg-white rounded"
              value="unread"
              onClick={() => handleFilterChange('unread')}
            >
              {t('UNREAD')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={filter} className="flex-1 overflow-auto p-0">
          {paginatedEmails?.length > 0 ? (
            <div className="flex flex-col">
              {paginatedEmails?.map((email) => (
                <div
                  key={email.id}
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left cursor-pointer p-4 hover:bg-neutral-50 flex flex-col gap-1 focus:outline-none focus:bg-neutral-50 ${
                    selectedEmail?.id === email.id && 'bg-surface'
                  } ${checkedEmailIds?.includes(email?.id) && 'bg-primary-50'} ${
                    email.isRead && 'bg-neutral-25'
                  }`}
                  onClick={() => handleEmailSelection(email)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEmailSelection(email);
                    }
                  }}
                >
                  <div className="flex flex-row gap-2">
                    <div className="flex space-x-2 pt-1">
                      <Checkbox
                        className="border-medium-emphasis data-[state=checked]:border-none border-2 rounded-[2px]"
                        checked={checkedEmailIds?.includes(email?.id)}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={(checked) => handleSingleEmailCheck(email.id, !!checked)}
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <h3
                            className={`text-high-emphasis ${email.isRead ? 'font-normal' : 'font-bold'}`}
                          >
                            {email?.sender ?? email?.recipient}
                          </h3>
                          {!email.isRead && (
                            <div className="flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="8"
                                viewBox="0 0 8 8"
                                fill="none"
                              >
                                <circle cx="4" cy="4" r="4" fill="#349DD8" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-medium-emphasis">
                          {formatReceivedDate(email.date)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm line-clamp-1 ${email.isRead ? 'font-normal' : 'font-bold'}`}
                        >
                          {email.subject}
                        </p>
                        <div className="flex gap-2 items-center">
                          {email.attachments && email.attachments.length > 0 && (
                            <Paperclip className="h-4 w-4 text-medium-emphasis" />
                          )}

                          {email.isStarred && <Star className="h-4 w-4 text-warning" />}
                        </div>
                      </div>
                      <div className="line-clamp-2 text-sm text-medium-emphasis">
                        {htmlToPlainText(email?.preview)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-medium-emphasis">
              {t('NO_DATA_FOUND')}
            </div>
          )}
        </TabsContent>

        {paginatedEmails.length > 0 && (
          <div className="flex justify-center border-t p-2">
            <CustomPaginationEmail
              totalItems={filteredEmails.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Tabs>

      {/* Mobile View */}
      <div>
        <Tabs
          defaultValue="all"
          className="flex md:hidden  min-w-[307px] h-[calc(100vh-130px)] flex-col gap-3"
        >
          <div className="flex flex-col items-center  justify-between px-4 py-3 gap-4 border-b">
            {checkedEmailIds?.length === 0 && (
              <TabsList className="grid grid-cols-2 rounded-md w-full text-sm p-1 bg-surface">
                <TabsTrigger
                  className="[&[data-state=active]]:bg-white rounded"
                  value="all"
                  onClick={() => setFilter('all')}
                >
                  {t('ALL')}
                </TabsTrigger>
                <TabsTrigger
                  className="[&[data-state=active]]:bg-white rounded"
                  value="unread"
                  onClick={() => setFilter('unread')}
                >
                  {t('UNREAD')}
                </TabsTrigger>
              </TabsList>
            )}
            {checkedEmailIds?.length > 0 && (
              <div className="flex justify-start items-start  w-full space-x-2 ">
                <Checkbox
                  id="select-all"
                  checked={isAllChecked}
                  className="border-medium-emphasis data-[state=checked]:border-none border-2 rounded-[2px]"
                  onCheckedChange={(checked) => handleSelectAllChange(!!checked)}
                />

                <Label className="text-sm font-medium ">{t('SELECT_ALL')}</Label>
              </div>
            )}
          </div>

          <TabsContent value={filter} className="flex-1 overflow-hidden p-0">
            {paginatedEmails?.length > 0 ? (
              <div className="relative h-full">
                <div className="flex flex-col overflow-auto h-full">
                  {paginatedEmails.map((email) => (
                    <div
                      key={email.id}
                      role="button"
                      tabIndex={0}
                      className={`w-full text-left cursor-pointer p-4 hover:bg-neutral-50 flex flex-col gap-1 focus:outline-none focus:bg-neutral-50 ${selectedEmail?.id === email.id && 'bg-surface'} ${checkedEmailIds?.includes(email?.id) && 'bg-primary-50'} ${email.isRead && 'bg-neutral-25'}`}
                      onClick={() => handleEmailSelection(email)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleEmailSelection(email);
                        }
                      }}
                    >
                      <div className="flex flex-row gap-2">
                        <div className="flex space-x-2 pt-1">
                          <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            checked={checkedEmailIds?.includes(email.id)}
                            className="border-medium-emphasis data-[state=checked]:border-none border-2 rounded-[2px]"
                            onCheckedChange={(checked) =>
                              handleSingleEmailCheck(email.id, !!checked)
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2 justify-center items-center">
                              <h3
                                className={`text-high-emphasis ${email.isRead ? 'font-normal' : 'font-bold'}`}
                              >
                                {email?.sender ?? email?.recipient}
                              </h3>
                              {!email.isRead && (
                                <div>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="8"
                                    height="8"
                                    viewBox="0 0 8 8"
                                    fill="none"
                                  >
                                    <circle cx="4" cy="4" r="4" fill="#349DD8" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-medium-emphasis">
                              {formatReceivedDate(email.date)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm line-clamp-1 ${email.isRead ? 'font-normal' : 'font-bold'}`}
                            >
                              {email.subject}
                            </p>
                            <div className="flex gap-2 items-center">
                              {(email.images.length > 0 || email.attachments?.length > 0) && (
                                <Paperclip className="h-4 w-4 text-medium-emphasis" />
                              )}

                              {email.isStarred && (
                                <Star className="h-4 w-4 text-warning" fill="currentColor" />
                              )}
                            </div>
                          </div>
                          <div className="line-clamp-2 text-sm text-medium-emphasis">
                            {htmlToPlainText(email?.preview)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="absolute bottom-4 right-4 p-4 shadow-lg"
                  onClick={handleComposeEmail}
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-medium-emphasis">
                {t('NO_DATA_FOUND')}
              </div>
            )}
          </TabsContent>

          {paginatedEmails.length > 0 && (
            <div className="flex justify-center border-t p-4">
              <CustomPaginationEmail
                totalItems={filteredEmails.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Tabs>
      </div>
    </>
  );
};
