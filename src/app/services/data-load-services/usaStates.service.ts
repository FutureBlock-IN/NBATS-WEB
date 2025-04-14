import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface State {
  name: string;
  iso2: string;
  iso3: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsaStatesService {
  private statesUrl = '/assets/data/usa-states.json';
  private statesCache: State[] = [];

  constructor(private http: HttpClient) {}

  getStates(): Observable<State[]> {
    if (this.statesCache.length > 0) {
      return of(this.statesCache);
    }
    return this.http.get<State[]>(this.statesUrl).pipe(
      map(states => {
        this.statesCache = states;
        return states;
      })
    );
  }

  searchStates(query: string): Observable<State[]> {
    if (!query.trim()) {
      return of(this.statesCache);
    }
    const filteredStates = this.statesCache.filter(state =>
      state.name.toLowerCase().includes(query.toLowerCase())
    );
    return of(filteredStates);
  }
}
