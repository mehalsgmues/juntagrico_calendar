$(function () {
    $(window).on('scroll', function () {
        let scrollTop = $(this).scrollTop()
        let job_months = $('.job-month')
        let current = {position: job_months.first().offset().top - scrollTop, element: job_months.first()}
        job_months.slice(1).each(function () {
            let $this = $(this)
            let position = $this.offset().top - scrollTop

            if (position < 100 && position > current.position) {
                current = {position: position, element: $this}
            }
        })
        $('.current-month').text(current.element.data('title'))
    })

    $('.weekday-select').children().on('click', function () {
        let btn = $(this)
        btn.toggleClass(['btn-secondary', 'btn-primary'])
        apply_day_filters()
    })

    $('.time-after-select, .time-before-select').children().on('click', function (e) {
        let btn = $(this)
        btn.siblings().removeClass('btn-primary').addClass('btn-light')
        btn.toggleClass(['btn-light', 'btn-primary'])
        apply_filters()
        e.preventDefault()
        return false
    })

    $('#job_search_field').on('change keyup', apply_filters)

    $('#job_area_dropdown').on('click', collect_areas)
})

function apply_filters() {
    let job_cards = $('.job-details')
    job_cards.hide()
    let search = $('#job_search_field').val()
    job_cards = job_cards.has('p:contains("' + search + '")')  // TODO: make this case insensitive
    let earliest_start_time = parseFloat($('.time-after-select .btn-primary').text())
    let latest_end_time = parseFloat($('.time-before-select .btn-primary').text())
    if (earliest_start_time || latest_end_time) {
        job_cards.each(function () {
            let job_card = $(this)
            let start_time = parseFloat(job_card.data('startTime'))
            let end_time = parseFloat(job_card.data('endTime'))
            let late_enough = !start_time || start_time >= earliest_start_time
            let early_enough = !end_time || end_time <= latest_end_time
            if (earliest_start_time < latest_end_time) {
                job_card.toggle(late_enough && early_enough)
            } else {
                job_card.toggle(late_enough || early_enough)
            }
        })
    } else {
        job_cards.show()
    }
    apply_day_filters()
}

function apply_day_filters() {
    $('.job-day').show()
    $('.weekday-select:has(.btn-primary) .btn-secondary').each(function () {
        $('.job-day-' + $(this).text()).hide()
    })
    $('.job-day:not(:has(.job-details:visible))').hide()
}

function collect_areas() {
    let area_filter_template = $('#area_filter_template')
    let area_inputs = $('#area_inputs')
    if (area_inputs.children().length === 0) {
        let areas = new Map()
        $('.job-details').each(function () {
            let $this = $(this)
            areas.set($this.data('area'), $this.find('.job-area').text().trim())
        })
        areas = new Map([...areas].sort((a, b) => String(a[1]).localeCompare(b[1])))
        for (const [area, label] of areas) {
            let elem = area_filter_template.clone(true)
            elem.find('input').attr('id', 'area_filter_' + area)
            elem.find('label').attr('for', 'area_filter_' + area).text(label)
            elem.removeClass('d-none')
            area_inputs.append(elem)
        }
    }
}