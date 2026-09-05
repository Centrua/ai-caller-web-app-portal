import http from 'http'
import https from 'https'

export async function fetchJson(url: string): Promise<{ status: number; body: any }>
{
  return new Promise<any>((resolve, reject) => {
    try {
      const lib = url.startsWith('https') ? https : http
      lib.get(url, (resp: any) => {
        let data = ''
        resp.on('data', (chunk: any) => { data += chunk })
        resp.on('end', () => {
          try {
            const parsed = JSON.parse(data)
            resolve({ status: resp.statusCode, body: parsed })
          } catch (e) {
            resolve({ status: resp.statusCode, body: null })
          }
        })
      }).on('error', (err: any) => reject(err))
    } catch (err) { reject(err) }
  })
}

export default fetchJson
