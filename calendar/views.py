from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from juntagrico.views import get_menu_dict


@login_required
def home(request):
    renderdict = get_menu_dict(request)
    renderdict .update({
        'menu': {'cal': 'active'},
    })
    return render(request, "cal/home.html", renderdict)
