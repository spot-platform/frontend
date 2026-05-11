import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '@/lib/server-api';

type RouteContext = {
    params: Promise<{ path: string[] }>;
};

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function readRequestBody(request: NextRequest): Promise<BodyInit | null> {
    if (!BODY_METHODS.has(request.method)) {
        return null;
    }

    const body = await request.text();
    return body.length > 0 ? body : null;
}

async function proxyBackendRequest(
    request: NextRequest,
    context: RouteContext,
) {
    const { path } = await context.params;
    const search = request.nextUrl.search;
    const accessToken = request.cookies.get('spot-auth-token')?.value;
    const body = await readRequestBody(request);
    const upstream = await serverApiFetch(`/api/${path.join('/')}${search}`, {
        method: request.method,
        body,
        accessToken,
        headers: {
            'Content-Type':
                request.headers.get('content-type') ?? 'application/json',
        },
    });
    const responseBody = await upstream.text();
    const contentType =
        upstream.headers.get('content-type') ?? 'application/json';

    return new NextResponse(responseBody || null, {
        status: upstream.status,
        headers: {
            'Content-Type': contentType,
        },
    });
}

export async function GET(request: NextRequest, context: RouteContext) {
    return proxyBackendRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
    return proxyBackendRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
    return proxyBackendRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    return proxyBackendRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    return proxyBackendRequest(request, context);
}
