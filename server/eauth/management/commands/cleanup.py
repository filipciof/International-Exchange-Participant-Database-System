import os
from django.core.management.base import BaseCommand
from django.conf import settings
from main.models import (
    District,
    Club,
    Document,
    Exchange,
    ExchangeFamily,
    Family,
    FamilyMember,
    Contact,
    Student,
    Staff,
)


class Command(BaseCommand):
    help = "Hard deletes soft-deleted records and orphaned media files"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print what would be deleted without actually deleting anything",
        )

    def handle(self, *args, **options):
        self.dry_run: bool = options["dry_run"]
        if self.dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — nothing will be deleted\n"))

        self._purge_soft_deleted()
        self._purge_orphaned_files()

    # ------------------------------------------------------------------
    # Soft-deleted record purge
    # ------------------------------------------------------------------

    def _purge_soft_deleted(self):
        self.stdout.write("=== Purging soft-deleted records ===")

        # Dependent join tables first
        self._delete_qs(ExchangeFamily, "ExchangeFamily")
        self._delete_qs(Exchange, "Exchange")
        self._delete_qs(FamilyMember, "FamilyMember")

        # Records that own files — delete files alongside the records
        self._delete_with_file(Document, "file", "Document")
        self._delete_with_file(Contact, "photo", "Contact")
        self._delete_with_file(Student, "photo", "Student")
        self._delete_with_file(Staff, "photo", "Staff")

        # Plain records
        self._delete_qs(Family, "Family")
        self._delete_qs(Club, "Club")
        self._delete_qs(District, "District")

    def _delete_qs(self, model, label):
        qs = model.objects.filter(is_active=False)
        count = qs.count()
        if count == 0:
            return
        if not self.dry_run:
            qs.delete()
        self.stdout.write(
            f"  {'Would delete' if self.dry_run else 'Deleted'} {count} {label} record(s)"
        )

    def _delete_with_file(self, model, file_field, label):
        qs = model.objects.filter(is_active=False)
        count = qs.count()
        if count == 0:
            return
        if not self.dry_run:
            for obj in qs:
                f = getattr(obj, file_field)
                if f:
                    f.delete(save=False)
                obj.delete()
        self.stdout.write(
            f"  {'Would delete' if self.dry_run else 'Deleted'} {count} {label} record(s) (with files)"
        )

    # ------------------------------------------------------------------
    # Orphaned file purge
    # ------------------------------------------------------------------

    def _purge_orphaned_files(self):
        self.stdout.write("=== Purging orphaned media files ===")

        self._clean_dir(
            "student_photos",
            set(Student.objects.exclude(photo="").values_list("photo", flat=True)),
        )
        self._clean_dir(
            "staff_photos",
            set(Staff.objects.exclude(photo="").values_list("photo", flat=True)),
        )
        self._clean_dir(
            "contact_photos",
            set(Contact.objects.exclude(photo="").values_list("photo", flat=True)),
        )
        self._clean_dir(
            "documents",
            set(Document.objects.exclude(file="").values_list("file", flat=True)),
        )

    def _clean_dir(self, subdir, referenced_paths):
        dir_path = os.path.join(settings.MEDIA_ROOT, subdir)
        if not os.path.isdir(dir_path):
            return

        count = 0
        for filename in os.listdir(dir_path):
            relative_path = os.path.join(subdir, filename)
            if relative_path not in referenced_paths:
                count += 1
                if not self.dry_run:
                    os.remove(os.path.join(dir_path, filename))

        if count:
            self.stdout.write(
                f"  {'Would delete' if self.dry_run else 'Deleted'} {count} orphaned file(s) from {subdir}/"
            )
