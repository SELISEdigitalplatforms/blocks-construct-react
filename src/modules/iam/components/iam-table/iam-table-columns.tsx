import { ColumnDef } from '@tanstack/react-table';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui-kit/badge';
import { DataTableColumnHeader } from '@/components/core';
import { compareValues } from '../../services/user-service';
import { IamData } from '../../types/user.types';
import { DataTableRowActions } from './iam-table-row-actions';
import { CustomtDateFormat } from '@/lib/utils/custom-date/custom-date';
import { isIamDateInFilterRange } from '../../utils/iam-date-range-filter';

/**
 * Creates the columns for the IAM (Identity and Access Management) table.
 *
 * This function generates the column configuration for a table displaying user data,
 * including user details like name, email, MFA status, account creation date, last login,
 * user status (active/inactive), and actions (view details, reset password, resend activation).
 *
 * Features:
 * - Displays user information with sorting and filtering capabilities
 * - Supports custom actions such as viewing details, resetting passwords, and resending activations
 * - Filters by date range for both creation and last login dates
 * - Displays user status with color-coded badges based on active/inactive status
 * - Displays MFA status with enabled/disabled labels
 *
 * @param {ColumnFactoryProps} props - The props for configuring the table columns
 * @param {function} props.onViewDetails - Callback function triggered when the "View Details" action is clicked
 * @param {function} props.onResetPassword - Callback function triggered when the "Reset Password" action is clicked
 * @param {function} [props.onResendActivation] - Optional callback function triggered when the "Resend Activation" action is clicked
 *
 * @returns {ColumnDef<IamData, any>[]} - An array of column definitions for the IAM table
 *
 * @example
 * const columns = createIamTableColumns({
 *   onViewDetails: (user) => console.log(user),
 *   onResetPassword: (user) => console.log('Resetting password for:', user),
 *   onResendActivation: (user) => console.log('Resending activation for:', user),
 * });
 */

type StatusOption = {
  value: string | boolean;
  label: string;
  color: 'success' | 'error';
};

const getUserStatuses = (t: (key: string) => string): StatusOption[] => [
  { value: 'active', label: t('ACTIVE'), color: 'success' },
  { value: 'inactive', label: t('INACTIVE'), color: 'error' },
];

const getMfaStatuses = (t: (key: string) => string): StatusOption[] => [
  { value: true, label: t('ENABLED'), color: 'success' },
  { value: false, label: t('DISABLED'), color: 'error' },
];

interface ColumnFactoryProps {
  onViewDetails: (user: IamData) => void;
  onResetPassword: (user: IamData) => void;
  onResendActivation?: (user: IamData) => void;
  t: (key: string) => string;
}

const dateRangeFilterFn =
  (accessor: 'createdDate' | 'lastLoggedInTime') =>
  (row: { getValue: (id: string) => unknown }, id: string, filterValue: DateRange | undefined) => {
    const raw = row.getValue(id);
    const rowDate = new Date(raw as string);
    return isIamDateInFilterRange(rowDate, filterValue, accessor);
  };

export const createIamTableColumns = ({
  onViewDetails,
  onResetPassword,
  onResendActivation,
  t,
}: ColumnFactoryProps): ColumnDef<IamData, any>[] => [
  {
    id: 'fullName',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('NAME')} />,
    accessorFn: (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
    cell: ({ row }) => {
      const fullName = `${row.original.firstName} ${row.original.lastName}`.trim();
      return (
        <div className="flex items-center">
          <span className="max-w-[300px] truncate font-medium">{fullName}</span>
        </div>
      );
    },
  },
  {
    id: 'email',
    accessorFn: (row) => row.email,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('EMAIL')} />,
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className="max-w-[300px] truncate">{row.original.email}</span>
      </div>
    ),
  },
  {
    id: 'mfaEnabled',
    accessorFn: (row) => row.mfaEnabled,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('MFA')} />,
    cell: ({ row }) => {
      const mfaStatus = getMfaStatuses(t).find(
        (status) => status.value === row.original.mfaEnabled
      );
      if (!mfaStatus) return null;
      return <div className="flex items-center">{mfaStatus.label}</div>;
    },
    filterFn: (row, id, value: string[]) => {
      if (value.length === 0) return true;
      const cellValue = row.getValue(id);
      return value.includes(String(cellValue));
    },
  },
  {
    id: 'createdDate',
    accessorFn: (row) => row.createdDate,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('JOINED_ON')} />,
    cell: ({ row }) => {
      const date = new Date(row.original.createdDate);
      return (
        <div className="flex items-center">
          <span>{CustomtDateFormat(date)}</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = new Date(rowA.original.createdDate).getTime();
      const b = new Date(rowB.original.createdDate).getTime();
      return compareValues(a, b);
    },
    filterFn: dateRangeFilterFn('createdDate'),
  },
  {
    id: 'lastLoggedInTime',
    accessorFn: (row) => row.lastLoggedInTime,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('LAST_LOGIN')} />,
    cell: ({ row }) => {
      const date = new Date(row.original.lastLoggedInTime);
      if (date.getFullYear() === 1) {
        return <div className="text-muted-foreground">-</div>;
      }
      return (
        <div>
          <span>{CustomtDateFormat(date)}</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = new Date(rowA.original.lastLoggedInTime).getTime();
      const b = new Date(rowB.original.lastLoggedInTime).getTime();
      return compareValues(a, b);
    },
    filterFn: dateRangeFilterFn('lastLoggedInTime'),
  },
  {
    id: 'active',
    accessorFn: (row) => row.active,
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('STATUS')} />,
    cell: ({ row }) => {
      const status = getUserStatuses(t).find(
        (status) => status.value === (row.original.active ? 'active' : 'inactive')
      );
      if (!status) return null;
      return (
        <div className="flex items-center">
          <Badge
            variant="outline"
            className={status.color === 'success' ? 'text-success' : 'text-error'}
          >
            {status.label}
          </Badge>
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId);
      const b = rowB.getValue(columnId);

      if (b === a) return 0;
      return a ? -1 : 1;
    },
    filterFn: (row, id, value: string[]) => {
      if (value.length === 0) return true;
      const cellValue = row.getValue(id);
      return value.includes(String(cellValue));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onViewDetails={onViewDetails}
        onResetPassword={onResetPassword}
        onResendActivation={onResendActivation}
      />
    ),
  },
];
