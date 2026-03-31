import { useQuery } from '@tanstack/react-query';
import { getMultiOrgs } from '../services/multi-orgs.service';
import type { GetOrganizationsParams, GetOrganizationsResponse } from '../types/multi-orgs.types';

export const useGetMultiOrgs = (params?: GetOrganizationsParams) => {
  return useQuery<GetOrganizationsResponse>({
    queryKey: ['getMultiOrgs', params],
    queryFn: () => getMultiOrgs(params),
  });
};
