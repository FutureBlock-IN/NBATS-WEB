import { Component ,EventEmitter,Output, inject} from '@angular/core';
import { ThemeService } from '../../../services/themes/theme.service';
import { CustomColors } from '../../../app-Constants/app.colors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-global-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-input.component.html',
  styleUrl: './global-input.component.css'
})
export class GlobalInputComponent {
  @Output() inputDataChange = new EventEmitter<string>();
  private _inputData: string = '';
  themeService:ThemeService = inject(ThemeService)
  appColor:CustomColors = inject(CustomColors)
  get inputData(): string {
    return this._inputData;
  }

  set inputData(value: string) {
    this._inputData = value;
    this.inputDataChange.emit(this._inputData);
  }
}
