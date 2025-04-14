import { Component, Input, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CustomColors } from '../../../app-Constants/app.colors';
@Component({
  selector: 'custom-icon-button',
  standalone: true,
  imports: [MatIcon,CommonModule],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.css'
})
export class IconButtonComponent {
@Input() iconName:string = '';
appColors:CustomColors = inject(CustomColors)
buttonColor:string = this.appColors.IconButtonIColor
}
