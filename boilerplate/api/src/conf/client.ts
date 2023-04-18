export default async () => {
  return {
    host: process.env.CLIENT_HOST ||
      (
        process.env.NODE_ENV === 'test' ?
         'http://localhost:3000' :
          'http://localhost:3000'
      ),
  }
}
