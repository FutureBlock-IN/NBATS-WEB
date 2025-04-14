import { Injectable ,signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
 themeSignal = signal<string>("light");

 setTheme(theme:string){
    this.themeSignal.set(theme);
 }
 updateTheme(): string{
   let valueTheme: string = '';
    this.themeSignal.update(value => {
      valueTheme = value;
        return value === "dark" ? "light" : "dark";
    });
    
    return valueTheme;
 }
}