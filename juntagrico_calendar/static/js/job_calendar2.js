$(function () {
    // load more jobs
    init_load_more_jobs()
    init_month_selection()

    $(window).on('scroll', update_month_button)
    update_month_button()

    $('#weekday_select').children().on('click', function () {
        let btn = $(this)
        btn.toggleClass(['btn-secondary', 'btn-primary'])
        let mirror_btn = $('#weekday_select_dropdown button[data-weekday="' + btn.data('weekday') + '"]')
        mirror_btn.toggleClass(['btn-light', 'btn-primary'])
        apply_day_filters()
    })

    $('#weekday_select_dropdown').children().on('click', function (e) {
        let btn = $(this)
        btn.toggleClass(['btn-light', 'btn-primary'])
        let mirror_btn = $('#weekday_select button[data-weekday="' + btn.data('weekday') + '"]')
        mirror_btn.toggleClass(['btn-secondary', 'btn-primary'])
        // update dropdown button
        let count_days = $('#weekday_select_dropdown .btn-primary').length
        let text = 'Tag'
        if (count_days == 1) {
            text = '1 Tag'
        } else if (count_days > 1) {
            text = count_days + ' Tage'
        }
        $('#weekday_dropdown')
            .toggleClass('btn-secondary', count_days == 0)
            .toggleClass('btn-primary', count_days > 0)
            .text(text)
        // apply
        apply_day_filters()
        e.preventDefault()
        return false
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
    $('#all_area_btn').on('click', function(e) {
        let btn = $(this)
        btn.removeClass('btn-light').addClass('btn-primary')
        btn.siblings().removeClass('btn-primary').addClass('btn-light')
        $('#job_area_dropdown').removeClass('btn-primary').addClass('btn-secondary').text('Alle Bereiche')  // TODO: Translate
        $('#area_inputs input').prop('checked', false)
        apply_filters()
        e.preventDefault()
        return false
    })
    $('#core_area_btn').on('click', function(e) {
        let btn = $(this)
        btn.removeClass('btn-light').addClass('btn-primary')
        btn.siblings().removeClass('btn-primary').addClass('btn-light')
        $('#job_area_dropdown').removeClass('btn-secondary').addClass('btn-primary').text('Nur Kernbereiche')  // TODO: Translate
        let core_areas = $('#area_inputs .core-area input')
        core_areas.prop('checked', true)
        $('#area_inputs input').not(core_areas).prop('checked', false)
        apply_filters()
        e.preventDefault()
        return false
    })
    $('#own_area_btn').on('click', function(e) {
        // TODO: deduplicate with above
        let btn = $(this)
        btn.removeClass('btn-light').addClass('btn-primary')
        btn.siblings().removeClass('btn-primary').addClass('btn-light')
        $('#job_area_dropdown').removeClass('btn-secondary').addClass('btn-primary').text('Nur meine Bereiche')  // TODO: Translate
        let core_areas = $('#area_inputs .own-area input')
        core_areas.prop('checked', true)
        $('#area_inputs input').not(core_areas).prop('checked', false)
        apply_filters()
        e.preventDefault()
        return false
    })
    $('#area_inputs input').prop('checked', false).on('change', function() {
        $('#area_btn button').removeClass('btn-primary').addClass('btn-light')
        let count = $('#area_inputs input:checked').length
        if (count > 0) {
            $('#job_area_dropdown').removeClass('btn-secondary').addClass('btn-primary').text(count + ' Bereiche') // TODO: Translate
            apply_filters()
        } else {
            $('#all_area_btn').trigger('click')
        }
    })
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

    // filter by area
    let selected_areas = $('#area_inputs input:checked').map(function() {
        return parseInt($(this).val());
    })
    if (selected_areas.length) {
        job_cards = job_cards.filter(function() {
            return $.inArray($(this).data('area'), selected_areas) != -1
        })
    }

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

    // filter by start time and required slots
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
    // show selected cards
    job_cards.show()
    all_job_cards.not(job_cards).hide()
    apply_day_filters()
}

function apply_day_filters() {
    $('.job-day').show()
    $('#weekday_select:has(.btn-primary) .btn-secondary').each(function () {
        $('.job-day-' + $(this).data('weekday')).hide()
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
