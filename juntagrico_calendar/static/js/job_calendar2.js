$(function () {
    // load more jobs
    init_load_more_jobs()
    init_month_selection()

    $(window).on('scroll', update_month_button)
    update_month_button()

    $('.weekday-select').children().on('click', function () {
        let btn = $(this)
        btn.toggleClass(['btn-secondary', 'btn-primary'])
        apply_day_filters()
    })

    $('.time-after-select, .time-before-select, #free-slot-select').children().on('click', function (e) {
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

function init_load_more_jobs() {
    $('#load_later_jobs a').on('click.load_more', function(e) {
        let btn = $(this)
        btn.hide().siblings().removeClass('d-none')  // show loader
        $.get(btn.data('url'), function(data) {
            btn.parent().replaceWith($(data).children())
            init_load_more_jobs()
            apply_filters()
        })
        e.preventDefault()
        return false
    })
}

function init_month_selection() {
    // check for each month if it is already loaded. If not make it link to a new page with that month
    $('.month-selection').children().on('click.month', function(e) {
        let month_link = $(this)
        let href = month_link.attr('href')
        if (href[0] === '#' && !$(href).length) {
            // load missing content
            // TODO: Show loader
            $('#jobs_calendar').load(month_link.data('url') + ' #jobs_calendar > *', function() {
                init_load_more_jobs()
                apply_filters()
                update_month_button()
            })
            e.preventDefault()
            return false
        }
        // otherwise do default action
    })
}

function update_month_button() {
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
}

function apply_filters() {
    let job_cards = $('.job-details')
    let all_job_cards = job_cards
    let search = $('#job_search_field').val()
    job_cards = job_cards.has('p:contains("' + search + '")')  // TODO: make this case insensitive

    // slot and date filter
    let selected_free_slots = $('#free-slot-select .btn-primary')
    let required_free_slots = parseInt(selected_free_slots.data('value') || selected_free_slots.text()) || 0

    let earliest_start_time = parseFloat($('.time-after-select .btn-primary').text()) || false
    let latest_end_time = parseFloat($('.time-before-select .btn-primary').text()) || false

    // update display
    $('#job_slots_dropdown')
        .toggleClass('btn-secondary', !required_free_slots)
        .toggleClass('btn-primary', required_free_slots > 0)
        .children('span').text(required_free_slots || '')

    let activate = earliest_start_time !== false || latest_end_time !== false
    let time_text = ''
    if (earliest_start_time && latest_end_time) {
        // TODO: translate these
        time_text = earliest_start_time + ' - ' + latest_end_time + ' Uhr'
    } else if (earliest_start_time) {
        time_text = 'nach ' + earliest_start_time + ' Uhr'
    } else if (latest_end_time) {
        time_text = 'vor ' + latest_end_time + ' Uhr'
    }
    $('#job_time_dropdown').dropdown('update')
        .toggleClass('btn-secondary', !activate)
        .toggleClass('btn-primary', activate)
        .children('span').text(time_text)

    // show selected cards
    if (earliest_start_time || latest_end_time || required_free_slots) {
        job_cards = job_cards.filter(function (index) {
            let job_card = $(this)
            // filter by slots
            let available_slots = parseInt(job_card.data('freeSlots'))
            if (available_slots < required_free_slots) {
                return false
            }
            // filter by time
            if (earliest_start_time || latest_end_time) {
                let start_time = parseFloat(job_card.data('startTime'))
                let end_time = parseFloat(job_card.data('endTime'))
                if (earliest_start_time > latest_end_time) {
                    // if job can't be between the selected times, treat conditions as OR
                    if (start_time && start_time < earliest_start_time && end_time && end_time > latest_end_time) {
                        return false
                    }
                } else {
                    // otherwise both conditions must be met
                    if (start_time && start_time < earliest_start_time) {
                        return false
                    }
                    if (end_time && end_time > latest_end_time) {
                        return false
                    }
                }
            }
            return true
        })
    }
    job_cards.show()
    all_job_cards.not(job_cards).hide()
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