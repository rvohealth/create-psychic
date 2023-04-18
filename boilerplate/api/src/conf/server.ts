export default async () => {
  return {
    host: process.env.API_HOST ||
      (
        process.env.NODE_ENV === 'test' ?
         'http://localhost:7776' :
          'http://localhost:7777'
      ),
  }
}

