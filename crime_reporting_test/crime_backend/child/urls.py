from django.urls import path
from .views import CrimeReportListCreate, UserRegisterView, ChangePasswordView, changeEmailView#, CrimeHotspotListCreate
from .views import LogoutView, deleteAccountView, CrimeHotspotview, Crime_nearby_view
from django.http import HttpResponse
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('test/', lambda request: HttpResponse("OK")),
    path('crime-reports/', CrimeReportListCreate.as_view()),
    path('register/', UserRegisterView.as_view()),
    path('login/', obtain_auth_token),
    path('change-password/', ChangePasswordView.as_view()),
    path('change-email/', changeEmailView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('delete-account/', deleteAccountView.as_view()),
    path('crime-hotspots/', CrimeHotspotview.as_view()),
    path('crime-nearby/', Crime_nearby_view.as_view()),
 #   path('crime-hotspots/', CrimeHotspotListCreate.as_view()),
]