import {parseBody} from "../src/util/validate";
import {RegistrationRequestSchema} from "../src/model/registration-request";

describe('Validation utils', () => {
    it('Should validate a schema', () => {
        const parsed = parseBody(JSON.stringify({
            name: 'Timo',
            email: 'tcb@gmail.com',
            password: 'abdslkad'
        }), RegistrationRequestSchema)
    })
})