import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ResponseEventDTO } from '../../../models/serviceModels/event/responseEvent';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-item-selector',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './item-selector.component.html',
  styleUrls: ['./item-selector.component.css'],
})
export class ItemSelectorComponent {
  @Input() items: any[] = [];
  @Input() defaultImageUrl: string = '';
  @Input() isLoading = false;
  @Input() itemType: string = 'event';
  @Output() select = new EventEmitter<number>();
  @Output() add = new EventEmitter<void>();
  @Input() noItemsMessage: { title: string; description: string } = {
    title: '',
    description: '',
  };
  @Input() selectedIds: Set<number> = new Set();
  @Input() showSearchBar: boolean = true;
  @Input() showAddButton: boolean = true; // default: show the button

  selectedItems: number[] = [];
  searchTerm: string = '';

  ngOnInit(): void {}

  onSelect(item: ResponseEventDTO): void {
    const itemId = item.id;
    if (this.isSelected(itemId)) {
      this.selectedIds.delete(itemId);
    } else {
      this.selectedIds.add(itemId);
    }
    this.select.emit(itemId);
  }

  isSelected(itemId: number): boolean {
    return this.selectedIds.has(itemId);
  }

  getBackgroundStyle(
    logoUrl: string | null,
    defaultImageUrl: string
  ): { [key: string]: string } {
    return {
      'background-image': `url(${logoUrl ? logoUrl : defaultImageUrl})`,
      'background-size': 'cover',
      'background-position': 'center',
    };
  }

  getTruncatedTitle(item: any): string {
    let title;
    if (item.title === undefined) {
      title = item.firstName + ' ' + item.lastName;
    } else {
      title = item.title;
    }

    return title;
  }

  // Update filteredRoles based on itemType
  filteredRoles() {
    if (!this.searchTerm) {
      return this.items;
    }

    // Filter based on itemType
    if (this.itemType === 'staff') {
      return this.items.filter((staff) =>
        `${staff.firstName} ${staff.lastName}`
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    } else if (this.itemType === 'participant') {
      return this.items.filter((participant) =>
        `${participant.firstName} ${participant.lastName}`
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }

    return this.items; // In case itemType is anything else
  }

  onAddClick(): void {
    this.add.emit();
  }
}
