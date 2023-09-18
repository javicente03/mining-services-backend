declare namespace Models {

    export interface Email {
        from: string;
        to: string | string[];
        subject: string;
        text: string;
        html: any;
    }
}