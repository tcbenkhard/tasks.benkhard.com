import {handler} from "../src/login-handler";

describe('Login handler', () => {
    it('should parse login shit goed', () => {
        handler({headers: {
            'Authorization': 'Basic tcbenkhard@gmail.com DitIsEenTest'
            }} as any, {} as any)
    })
});