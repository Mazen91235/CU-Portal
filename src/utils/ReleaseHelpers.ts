import type { ReleaseResponseDto } from "../types/dtos/ReleaseDtos";
import type { Release } from "../types/entities/Release";

export const mapReleaseResponse = (release: ReleaseResponseDto): Release => ({
  id: release.id ?? undefined,
  release_number: release.release_number ?? undefined,
  title: release.title ?? undefined,
  date: release.date ?? undefined,
  created_at: release.created_at,
  updated_at: release.updated_at,
  version: release.version?.version_number ?? undefined,
  release_items: release.release_items?.map((item) => ({
    id: item.id ?? undefined,
    item_type: item.item_type ?? undefined,
    content: item.content ?? undefined,
    created_at: item.created_at,
    updated_at: item.updated_at,
    release_id: release.id ?? undefined,
  })),
});
