import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cache = new Map<string, any>();
  private cacheTimestamps = new Map<string, number>(); // To store cache timestamps

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }
    return null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, data);
  }

  getCacheTimestamp(key: string): number | null {
    return this.cacheTimestamps.get(key) || null;
  }

  setCacheTimestamp(key: string, timestamp: number): void {
    this.cacheTimestamps.set(key, timestamp);
  }

  clearCache(key: string): void {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
  }
}
