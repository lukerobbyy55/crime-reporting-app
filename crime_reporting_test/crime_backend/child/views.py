from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CrimeReport#, CrimeHotspot
from .serializers import ReportSerializer, UserRegisterSerializer, ChangePasswordSerializer, changeEmailSerializer #, CrimeHotspotSerializer
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.db.models import Count
from math import radians, cos, sin, asin, sqrt
from django.utils import timezone
from datetime import timedelta
#from .firebase import send_crime_notification



def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the Earth specified in decimal degrees.
    """
    # Convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371  # Radius of Earth in kilometers
    return c * r




def send_crime_notification(crime_type, lat, lon):
    # Placeholder function I made for now until I  integrate Firebase Cloud Messaging
    print(f"Sending notification for crime type: {crime_type} at location ({lat}, {lon})")



class CrimeReportCreateView(generics.CreateAPIView):
    queryset = CrimeReport.objects.all()
#    serializer_class = CrimeReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        crime = serializer.save(user=self.request.user)

 #       send_crime_notification(
  #          crime.crime_type,
  #          crime.latitude,
  #          crime.longitude
  #      )


#class CrimeHotspotListView(generics.ListAPIView):
#    queryset = CrimeHotspot.objects.all()
#    serializer_class = CrimeHotspotSerializer
#    permission_classes = [AllowAny]

class CrimeReportListCreate(generics.ListCreateAPIView):
    queryset = CrimeReport.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        crime = serializer.save(reported_by=self.request.user)
        send_crime_notification(crime.crime_type, crime.lat, crime.lon)


class UserRegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.get_object()
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
    

class changeEmailView(generics.UpdateAPIView):
    serializer_class = changeEmailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.get_object()
        user.email = serializer.validated_data['new_email']
        user.save()
        return Response({"detail": "Email updated successfully."}, status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def logout(self, request):
        request.user.auth_token.delete()
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
    

class deleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"detail": "Account deleted successfully."}, status=status.HTTP_200_OK)
    

class CrimeHotspotview(APIView):
    def get(self, request):
        reports = CrimeReport.objects.values('lat', 'lon').annotate(count=Count('id'))

        for report in reports:
            report['lat'] = round(report['lat'], 2)
            report['lon'] = round(report['lon'], 2)
        return Response(list(reports))
    
class Crime_nearby_view(APIView):
    def get(self, request):
        try:
            lat = float(request.query_params.get('lat'))
            lon = float(request.query_params.get('lon'))
            radius = float(request.query_params.get('radius', 3))
        except (TypeError, ValueError):
            return Response({"error": "Invalid or missing query parameters."}, status=status.HTTP_400_BAD_REQUEST)
   
        three_months_ago = timezone.now() - timedelta(days=90)
        reports = CrimeReport.objects.filter(occurred_at__gte=three_months_ago)
        nearby_crimes = []
        
        for report in reports:
            distance = haversine(lon, lat, report.lon, report.lat)
            if distance <= radius:
                nearby_crimes.append(report)
        serializer = ReportSerializer(nearby_crimes, many=True)
        return Response(serializer.data)