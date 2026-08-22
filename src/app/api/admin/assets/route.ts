import { NextRequest, NextResponse } from "next/server";
import { getSiteAssets, saveSiteAsset, deleteSiteAsset, addAuditLog } from "@/lib/storage";
import { SiteAsset } from "@/types/admin";

export async function GET() {
  try {
    const assets = await getSiteAssets();
    return NextResponse.json({ success: true, data: assets });
  } catch (err) {
    console.error("Fetch site assets error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch assets." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SiteAsset & { action?: string };

    if (body.action === "delete" && body.id) {
      await deleteSiteAsset(body.id);
      await addAuditLog("ASSET_UPDATE", `Deleted site asset: ${body.name || body.id}`);
      return NextResponse.json({ success: true, message: "Asset deleted." });
    }

    if (!body.assetKey || !body.assetUrl) {
      return NextResponse.json({ success: false, error: "Asset key and URL are required." }, { status: 400 });
    }

    const asset: SiteAsset = {
      id: body.id || `asset-${Date.now()}`,
      assetKey: body.assetKey,
      name: body.name || body.assetKey,
      assetUrl: body.assetUrl,
      assetType: body.assetType || "image",
      section: body.section || "General",
      altText: body.altText || body.name || "CodeXa Asset",
      isActive: body.isActive ?? true,
      updatedAt: new Date().toISOString(),
    };

    await saveSiteAsset(asset);
    await addAuditLog("ASSET_UPDATE", `Updated asset configuration: ${asset.assetKey} -> ${asset.assetUrl}`);

    return NextResponse.json({ success: true, data: asset });
  } catch (err) {
    console.error("Save site asset error:", err);
    return NextResponse.json({ success: false, error: "Failed to save asset." }, { status: 500 });
  }
}
