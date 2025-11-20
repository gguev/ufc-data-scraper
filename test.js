import {
  getEvent,
  getFight,
  getFighter,
  getFighterRecord,
  getFighters,
  getPastEvents,
  getRankings,
  getTitleholders,
  getUpcomingEvents
} from './dist/index.js'

async function test() {
  // GOOD CALLS
  const event = await getEvent('ufc-321')
  console.dir(event)

  const fight = await getFight('ufc-321', 12402)
  console.dir(fight)

  const fighter = await getFighter('petr-yan')
  console.dir(fighter)

  //   const record = await getFighterRecord('ilia-topuria')
  //   console.dir(record)

  //   const fighters = await getFighters(0)
  //   console.dir(fighters)

  //   const pastEvents = await getPastEvents()
  //   console.dir(pastEvents)

  //   const upcomingEvents = await getUpcomingEvents()
  //   console.dir(upcomingEvents)

  //   const rankings = await getRankings()
  //   console.dir(rankings)

  //   const titleholders = await getTitleholders()
  //   console.dir(titleholders)

  // BAD CALLS
  //   const f1 = await getFighter('invalid-fighter-12345')
  //   const f2 = await getFighter('')
  //   const f3 = await getFighter(null)

  //   const f1 = await getFight('invalid-event-12345', 1)
  //   console.log(f1)

  //   const invalidf = await getFight('ufc-321', 99999)
  //   console.log(invalidf)

  //   const fights = await getEvent('invalid-event-12345')
  //   console.log(fights)

  //   const invalidfs = await getEvent('')
  //   console.log(invalidfs)

  //   const records = await getFighterRecord('invalid-fighter-12345', 0)
  //   console.log(records)

  //   const fighters = await getFighters(999)
  //   coonsole.log(fighters)

  //   const events = await getPastEvents(999)
  //   console.log(events)
}

test()
