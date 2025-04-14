import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";

@Injectable({
    providedIn: "root"
})

export class AuthorizationProps {
    private SecretKey: string
    private SecretValue: string
    constructor() {
        this.SecretKey = environment.ApiUrl.client_id;
        this.SecretValue = environment.ApiUrl.client_secret
    }
    getbasicAuth() {
        const prefix = 'Basic';
        const combined = `${this.SecretKey}:${this.SecretValue}`;
        const encoded = btoa(combined);
        return `${prefix} ${encoded}`;
    }
}