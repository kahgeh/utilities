class SecureString {
    
    constructor(data) {
        this.data = data;
    }
    public toString = () => {
        return "[securestring]";
    }
    public toJSON  = () => {
        return this.toString();
    }
    public getSecureStringValue = () => {
        return this.data;
    }
    private data: string;
}