import { Component,signal} from '@angular/core';

import { MedicationOrderForm } from './features/medication-order/medication-order-form/medication-order-form';

@Component({
  selector: 'app-root',
  imports: [MedicationOrderForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('patient-medication-management-system');
}
