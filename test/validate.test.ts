import {parseBody} from "../src/util/validate";
import {RegistrationRequestSchema} from "../src/model/requests/registration-request";
import * as jwt from "jsonwebtoken";

describe('Validation utils', () => {
    it('Should validate a schema', () => {
        const parsed = parseBody(JSON.stringify({
            name: 'Timo',
            email: 'tcb@gmail.com',
            password: 'abdslkad'
        }), RegistrationRequestSchema)
    })

    it('should test', () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzA5NjM3MDQ4LCJleHAiOjE3MDk3MjM0NDgsInN1YiI6InRjYmVua2hhcmRAZ21haWwuY29tIn0.p29e9S7oIuSwnx24hhzmemooW1dDMfB_mnvZb1JnrY0'
        const signingKey = 'RandomSigningKeyThatIsNotRealAtAll'
        const result = jwt.verify(token, signingKey, {})
        console.log(result)
    })
})