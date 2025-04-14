import { Component, inject } from '@angular/core';
import { CustomColors } from '../../../app-Constants/app.colors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'input-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-button.component.html',
  styleUrl: './input-button.component.css'
})
export class InputButtonComponent {
appColors:CustomColors=inject(CustomColors)
}
