import { Injectable } from "@angular/core"

@Injectable(
    {
        providedIn: 'root'
    }
)

export class CustomColors {
    public  primaryColor: string = '#005cbb'
    public  secondaryColor: string = '#f5f5f5'
    public  tertiaryColor: string = '#fff'
    public iconButtonHoverColor:string = '#f0f0f0'
    public IconButtonIColor:string = '#555'
    public IconButtonIHoverColor:string = '#555' ; 
    public InputButtonHoverFocurColor:string = '#0783ff'
}