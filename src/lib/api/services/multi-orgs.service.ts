import { clients } from '@/lib/https';
import type { GetOrganizationsParams, GetOrganizationsResponse } from '../types/multi-orgs.types';

const buildQueryString = (params?: GetOrganizationsParams): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const getMultiOrgs = async (
  params?: GetOrganizationsParams
): Promise<GetOrganizationsResponse> => {
  const queryString = buildQueryString(params);
  const res = await clients.get<GetOrganizationsResponse>(
    `/idp/v1/Iam/GetOrganizations${queryString}`
  );
  return res;
};
