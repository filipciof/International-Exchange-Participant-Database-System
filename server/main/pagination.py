from rest_framework.pagination import PageNumberPagination


class OptionalPageNumberPagination(PageNumberPagination):
    """Only paginates when ?page= is present. Preserves flat list responses otherwise."""

    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        if request.query_params.get(self.page_query_param) is None:
            return None
        return super().paginate_queryset(queryset, request, view)
