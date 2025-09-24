const ufc = require('./dist/index')

async function testScraper() {
    try {
        // console.log('Testing fighter data...')
        const rankings = await ufc.getRankings()
        console.log('Rankings:', rankings)

        const champs = await ufc.getTitleholders()
        console.log('Champions:', champs)

        const fighter = await ufc.getFighter('https://www.ufc.com/athlete/assu-almabayev')
        console.log('Fighter:', fighter);
    } catch (err) {
        console.error('Test failed: ', error)
    }
}

testScraper();