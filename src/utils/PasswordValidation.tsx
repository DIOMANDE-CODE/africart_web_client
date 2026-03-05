export function validatePassword(password: string): boolean {

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    
    return regex.test(password);
}