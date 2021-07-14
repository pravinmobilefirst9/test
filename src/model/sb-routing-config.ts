import { QueryParamConfig } from './sb-event-listener';

export interface RoutingConfig {
  // Include local url in Path object and open up possibility to navigate to external sources?
  url: string;
  // Parameters to include in the route
  queryParameters: QueryParamConfig[];
}
