import { Injectable } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { UserElement } from '../common/interface/user';

@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  selection = new SelectionModel<UserElement>(true, []);
  clearSelection(): void {
    this.selection.clear();
  }
}
