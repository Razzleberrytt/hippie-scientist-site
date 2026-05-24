import { useQuery } from "@tanstack/react-query";
import { IndexItem, DetailItem, StackItem } from "@/lib/types";

export function useHerbs() {
  return useQuery<IndexItem[]>({
    queryKey: ["herbs"],
    queryFn: () => fetch("/data/herb-index.json").then((res) => res.json()),
  });
}

export function useCompounds() {
  return useQuery<IndexItem[]>({
    queryKey: ["compounds"],
    queryFn: () => fetch("/data/compound-index.json").then((res) => res.json()),
  });
}

export function useHerb(slug: string) {
  return useQuery<DetailItem>({
    queryKey: ["herb", slug],
    queryFn: () => fetch(`/data/herb-detail/${slug}.json`).then((res) => res.json()),
    enabled: !!slug,
  });
}

export function useCompound(slug: string) {
  return useQuery<DetailItem>({
    queryKey: ["compound", slug],
    queryFn: () => fetch(`/data/compound-detail/${slug}.json`).then((res) => res.json()),
    enabled: !!slug,
  });
}

export function useStacks() {
  return useQuery<StackItem[]>({
    queryKey: ["stacks"],
    queryFn: () => fetch("/data/stacks.json").then((res) => res.json()).catch(() => []),
  });
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: () => fetch("/data/goal-pages.json").then((res) => res.json()).catch(() => []),
  });
}
