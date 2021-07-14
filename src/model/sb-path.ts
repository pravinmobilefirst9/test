import { SbRequestMethod } from './sb-request-method.enum';
import { SbHost } from './sb-host-enum';

export interface SbPath {
  // Todo - reference by id
  // Host can be set if different than the standard data host
  host?: string;
  // Enables overriding base url/host by referering to urls set in appconfig file.
  // To be removed when all url routes are handled by gateway
  hostEnum?: SbHost;
  // Relative path can be set to override the standard data path
  relativePath?: string;
  // Resource relative to host & relativepath --> path = host + relativePath + resource
  resource: string;
  // Todo - implement for all paths!!
  // version: number;
  useSsl?: boolean;
  // Use if other than standard get
  httpMethod?: SbRequestMethod;
}
