interface TokenPayload {
    type: 'access' | 'refresh'
    iat: number,
    exp: number,
    sub: string
}