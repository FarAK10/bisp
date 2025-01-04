import { StorageService } from '../services/storage.service';

export type JwtOptions = {
  tokenGetter: () => string;
};

export function jwtOptionsFactory(storageService: StorageService): JwtOptions {
  return {
    tokenGetter: (): string => storageService.accessToken,
  };
}
