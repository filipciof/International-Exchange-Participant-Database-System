from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from main.models import Year
from main.serializers import YearSerializer
from main.permissions import YearPermission


class YearListView(ListCreateAPIView):
    permission_classes = [YearPermission]
    serializer_class = YearSerializer

    def get_queryset(self):
        return Year.objects.all().order_by("-value")


class YearDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [YearPermission]
    serializer_class = YearSerializer
    queryset = Year.objects.all()
