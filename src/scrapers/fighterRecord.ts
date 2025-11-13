import * as cheerio from 'cheerio'
import { fetchHtml } from '../utils/fetch.js'

export async function getFighterRecord(
  fighterSlug: string,
  pageNumber: number = 0
) {
  try {
    const url = `https://www.ufc.com/athlete/${fighterSlug}?page=${pageNumber}`

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    return parseFighterRecord($)
  } catch (err) {}
}

function parseFighterRecord($: cheerio.Root) {
  const fights = []

  $('li.l-listing__item article.c-card-event--athlete-results').each(
    (_, card) => {
      const $card = $(card)

      const $red = $card.find('.c-card-event--athlete-results__red-image')
      const $blue = $card.find('.c-card-event--athlete-results__blue-image')
      const result = (el: cheerio.Cheerio) =>
        el.hasClass('win') ? 'win' : el.hasClass('loss') ? 'loss' : 'draw'

      const method = $card
        .find('.c-card-event--athlete-results__result-label:contains("Method")')
        .next()
        .text()
        .trim()
      const round = parseInt(
        $card
          .find(
            '.c-card-event--athlete-results__result-label:contains("Round")'
          )
          .next()
          .text()
          .trim(),
        10
      )
      const time = $card
        .find('.c-card-event--athlete-results__result-label:contains("Time")')
        .next()
        .text()
        .trim()

      const eventPath =
        $card
          .find('.c-card-event--athlete-results__actions a[href*="/event/"]')
          .attr('href') || ''

      const url = new URL(eventPath)
      const clean = url.pathname + url.hash
      const [eventSlug, fightId] = clean.replace(/^\/event\//, '').split('#')

      const eventDate = $card
        .find('.c-card-event--athlete-results__date')
        .text()
        .trim()

      const redName = $red.find('img').attr('alt')?.trim() || ''
      const redSlug =
        $red.find('a').attr('href')?.split('/').pop()?.trim() || ''

      const blueName = $blue.find('img').attr('alt')?.trim() || ''
      const blueSlug =
        $blue.find('a').attr('href')?.split('/').pop()?.trim() || ''

      fights.push({
        fightId: Number(fightId),
        event: {
          name: `UFC ${eventSlug.replace('ufc-', '')}`,
          slug: eventSlug,
          date: new Date(eventDate).toISOString().split('T')[0],
        },
        red: {
          name: redName,
          slug: redSlug,
          result: result($red),
        },
        blue: {
          name: blueName,
          slug: blueSlug,
          result: result($blue),
        },
        result: { method, round, time },
      })
    }
  )

  return fights
}

/*
How is this for the scraped object?
fight: Topuria vs Oliveira
red: Ilia Topuria
blue: Charles Oliveira
date: Jun. 28, 2025 (format?)
result: {
  method: KO/TKO,
  round: 1,
  time: 2:27
}

Any other fields I should scrape? Should I modify this object in any way to improve it?

*/

/* 
Here are the selectors:

<div id="athlete-record" class="athlete-record">
                  <div class="l-container l-listing__title-wrap">
            <div class="l-container__content">
              <h2 class="l-listing__title">
                athlete record
              </h2>
            </div>
          </div>
                          <div class="l-container">
  <div class="view view-eva view-athlete-results view-id-athlete_results view-display-id-entity_view_1 js-view-dom-id-ec2050674066c291ef99f61b7d093015261940713232c4b272bd0d4beea79382" data-once="ajax-pager">
  <div data-drupal-views-infinite-scroll-content-wrapper="" class="views-infinite-scroll-content-wrapper clearfix">
<section class="l-listing--stacked">
      <ul class="l-listing__group"><li class="l-listing__item" data-once="l-listing-animation" style="visibility: inherit; opacity: 1; transform: matrix(1, 0, 0, 1, 0, 0);">
<article class="c-card-event--athlete-results">
  <div class="c-card-event--athlete-results__fight-container">
              <div class="c-card-event--athlete-results__matchup-container">
        <div class="c-card-event--athlete-results__matchup-wrapper">
          <div class="c-card-event--athlete-results__matchup">
            <div class="c-card-event--athlete-results__image c-card-event--athlete-results__red-image win">
                              <div class="c-card-event--athlete-results__plaque win">
                  Win
                </div>
                            <a href="https://www.ufc.com/athlete/ilia-topuria">
                <div>
  
      <img src="https://ufc.com/images/styles/event_results_athlete_headshot/s3/2025-06/TOPURIA_ILIA_BELT_10-26.png?itok=ZD8DFM6O" width="256" height="160" alt="Ilia Topuria" loading="lazy" class="image-style-event-results-athlete-headshot">
</div>
              </a>
            </div>

            <div class="c-card-event--athlete-results__image c-card-event--athlete-results__blue-image loss">
                            <a href="https://www.ufc.com/athlete/charles-oliveira">
                <div>
  
      <img src="https://ufc.com/images/styles/event_results_athlete_headshot/s3/2025-10/OLIVEIRA_CHARLES_10-11.png?itok=vZYVQ-Bm" width="256" height="160" alt="Charles Oliveira" loading="lazy" class="image-style-event-results-athlete-headshot">
</div>
              </a>
            </div>
          </div>
        </div>
      </div>
          </div>
  <div class="c-card-event--athlete-results__info">
          <h3 class="c-card-event--athlete-results__headline">
                  <a href="https://www.ufc.com/athlete/ilia-topuria">Topuria</a>
          <span>vs</span>
          <a href="https://www.ufc.com/athlete/charles-oliveira">Oliveira</a>
                </h3>

      <div class="c-card-event--athlete-results__date">Jun. 28, 2025</div>  
                    <div class="c-card-event--athlete-results__results">
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Round</div>
              <div class="c-card-event--athlete-results__result-text">1</div>
            </div>
          
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Time</div>
              <div class="c-card-event--athlete-results__result-text">2:27</div>
            </div>
          
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Method</div>
              <div class="c-card-event--athlete-results__result-text">KO/TKO</div>
            </div>
                  </div>
            </div>

  <div class="c-card-event--athlete-results__actions">
<a href="//ufcfightpass.com" target="1" class="e-button--arrow-right "><span class="e-button__text">
    Watch Replay
  </span></a>
<a href="https://www.ufc.com/event/ufc-317#12120" class="e-button--arrow-right "><span class="e-button__text">
    Fight Card
  </span></a>
      </div>
</article>
                  </li><li class="l-listing__item" data-once="l-listing-animation" style="visibility: inherit; opacity: 1; transform: matrix(1, 0, 0, 1, 0, 0);">
<article class="c-card-event--athlete-results">
    
  <div class="c-card-event--athlete-results__fight-container">
              <div class="c-card-event--athlete-results__matchup-container">
        <div class="c-card-event--athlete-results__matchup-wrapper">
          <div class="c-card-event--athlete-results__matchup">
            <div class="c-card-event--athlete-results__image c-card-event--athlete-results__red-image win">
                              <div class="c-card-event--athlete-results__plaque win">
                  Win
                </div>
                            <a href="https://www.ufc.com/athlete/ilia-topuria">
                <div>
  
      <img src="https://ufc.com/images/styles/event_results_athlete_headshot/s3/2025-06/TOPURIA_ILIA_BELT_10-26.png?itok=ZD8DFM6O" width="256" height="160" alt="Ilia Topuria" loading="lazy" class="image-style-event-results-athlete-headshot">
</div>
              </a>
            </div>

            <div class="c-card-event--athlete-results__image c-card-event--athlete-results__blue-image loss">
                            <a href="https://www.ufc.com/athlete/max-holloway">
                <div>
  
      <img src="https://ufc.com/images/styles/event_results_athlete_headshot/s3/2025-07/HOLLOWAY_MAX_BMF_07-19.png?itok=Z9zVlm7E" width="256" height="160" alt="Max Holloway" loading="lazy" class="image-style-event-results-athlete-headshot">
</div>

              </a>
            </div>
          </div>
        </div>
      </div>
          </div>
  <div class="c-card-event--athlete-results__info">
          <h3 class="c-card-event--athlete-results__headline">
                  <a href="https://www.ufc.com/athlete/ilia-topuria">Topuria</a>
          <span>vs</span>
          <a href="https://www.ufc.com/athlete/max-holloway">Holloway</a>
                </h3>

      <div class="c-card-event--athlete-results__date">Oct. 26, 2024</div>
      
                    <div class="c-card-event--athlete-results__results">
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Round</div>
              <div class="c-card-event--athlete-results__result-text">3</div>
            </div>
          
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Time</div>
              <div class="c-card-event--athlete-results__result-text">1:34</div>
            </div>
          
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Method</div>
              <div class="c-card-event--athlete-results__result-text">KO/TKO</div>
            </div>
                  </div>
            </div>

  <div class="c-card-event--athlete-results__actions">
        
<a href="//ufcfightpass.com" target="1" class="e-button--arrow-right "><span class="e-button__text">  
    Watch Replay
  </span></a>
  
<a href="https://www.ufc.com/event/ufc-308#11564" class="e-button--arrow-right "><span class="e-button__text">    
    Fight Card
  </span></a>
      </div>
</article>

                  </li><li class="l-listing__item" data-once="l-listing-animation" style="visibility: inherit; opacity: 1; transform: matrix(1, 0, 0, 1, 0, 0);">
<article class="c-card-event--athlete-results">
    
  <div class="c-card-event--athlete-results__fight-container">
              <div class="c-card-event--athlete-results__matchup-container">
        <div class="c-card-event--athlete-results__matchup-wrapper">
          <div class="c-card-event--athlete-results__matchup">
            <div class="c-card-event--athlete-results__image c-card-event--athlete-results__red-image loss">
                            <a href="https://www.ufc.com/athlete/alexander-volkanovski">
                <div>
  
      <img src="https://ufc.com/images/styles/event_results_athlete_headshot/s3/2024-02/VOLKANOVSKI_ALEXANDER_BELT_02-17.png?itok=u2-VOzne" width="256" height="160" alt="Alexander Volkanovski" loading="lazy" class="image-style-event-results-athlete-headshot">
</div>
              </a>
            </div>

            <div class="c-card-event--athlete-results__image c-card-event--athlete-results__blue-image win">
                              <div class="c-card-event--athlete-results__plaque win">
                  Win
                </div>
                            <a href="https://www.ufc.com/athlete/ilia-topuria">
                <div>
  
      <img src="https://ufc.com/images/styles/event_results_athlete_headshot/s3/2025-06/TOPURIA_ILIA_BELT_10-26.png?itok=ZD8DFM6O" width="256" height="160" alt="Ilia Topuria" loading="lazy" class="image-style-event-results-athlete-headshot">
</div>
              </a>
            </div>
          </div>
        </div>
      </div>
          </div>
  <div class="c-card-event--athlete-results__info">
          <h3 class="c-card-event--athlete-results__headline">
                  <a href="https://www.ufc.com/athlete/alexander-volkanovski">Volkanovski</a>
          <span>vs</span>
          <a href="https://www.ufc.com/athlete/ilia-topuria">Topuria</a>
                </h3>

      <div class="c-card-event--athlete-results__date">Feb. 17, 2024</div>      
                    <div class="c-card-event--athlete-results__results">
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Round</div>
              <div class="c-card-event--athlete-results__result-text">2</div>
            </div>
          
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Time</div>
              <div class="c-card-event--athlete-results__result-text">3:32</div>
            </div>
          
                      <div class="c-card-event--athlete-results__result">
              <div class="c-card-event--athlete-results__result-label">Method</div>
              <div class="c-card-event--athlete-results__result-text">KO/TKO</div>
            </div>
                  </div>
            </div>
  <div class="c-card-event--athlete-results__actions">
<a href="//ufcfightpass.com" target="1" class="e-button--arrow-right "><span class="e-button__text">
    Watch Replay
  </span></a>
<a href="https://www.ufc.com/event/ufc-298#11049" class="e-button--arrow-right "><span class="e-button__text">
    Fight Card
  </span></a>
      </div>
</article>
                  </li></ul></section>
</div>
<ul class="js-pager__items pager" data-drupal-views-infinite-scroll-pager="">
  <li class="pager__item">
    <a class="button" href="?page=1" title="Load more items" rel="next">Load More</a>
  </li>
</ul>
  </div>
          </div>
              </div>
*/
