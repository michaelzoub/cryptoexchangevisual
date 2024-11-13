

export async function fetchExchangeData() {
    const response = await fetch("https://min-api.cryptocompare.com/data/exchanges/general", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Apikey ${process.env.CCOMPARE_KEY}`
        }
    })
    const body = await response.json()
    console.log(body.Data)
    return body.Data
}