from rest_framework.serializers import ModelSerializer
from .models import Issues
from users.serializers import UserSerializer


class IssueSerializers(ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Issues
        fields = '__all__'
        