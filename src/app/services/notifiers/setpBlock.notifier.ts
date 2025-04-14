import { Injectable, signal } from "@angular/core";
@Injectable({
    providedIn: 'root'
})
export class StepBlockService{
    isStepBlockActive= signal<boolean>(false)
}