export interface GetOrganizationsParams {
  ProjectKey?: string;
  Page?: number;
  PageSize?: number;
  'Sort.Property'?: string;
  'Sort.IsDescending'?: boolean;
  'Filter.Name'?: string;
  'Filter.IsEnable'?: boolean;
  'Filter.ItemId'?: string;
  'Filter.CreatedDate'?: string;
  'Filter.LastUpdatedDate'?: string;
  'Filter.CreatedBy'?: string;
  'Filter.Language'?: string;
  'Filter.LastUpdatedBy'?: string;
  'Filter.OrganizationIds'?: string[];
  'Filter.Tags'?: string[];
}

export interface Organization {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
  language: string;
  lastUpdatedBy: string;
  organizationIds: string[];
  tags: string[];
  name: string;
  isEnable: boolean;
}

export interface GetOrganizationsResponse {
  errors?: {
    [key: string]: string;
  };
  isSuccess: boolean;
  organizations: Organization[];
  totalCount: number;
}
