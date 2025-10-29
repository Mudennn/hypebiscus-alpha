'use client'

import React from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { DetectedIntent } from '@/lib/intent-detector'

interface DAppData {
  // dappId: string
  name: string
  logo?: string
  website?: string
  [key: string]: unknown
}

interface DAppPanelProps {
  intent: DetectedIntent
  data?: Record<string, unknown>
  loading?: boolean
}

export default function DAppPanel({
  intent,
  data,
  loading,
}: DAppPanelProps) {
  // Extract DApp data from API response (handle both single and array responses)
  let dappData: DAppData | undefined

  if (data?.data) {
    const rawData = data.data
    if (Array.isArray(rawData)) {
      // If it's an array, take the first result
      dappData = rawData[0] as DAppData | undefined
    } else {
      // If it's a single object
      dappData = rawData as DAppData | undefined
    }
  }

  const dappName = intent.dapps?.[0] || 'Unknown Protocol'

  return (
    <div className="space-y-4">
      {/* Protocol Header Card */}
      <Card>
        <div className="flex items-center justify-start px-5 gap-3 pt-5">
          {dappData?.logo && (
            <Image
              src={dappData.logo}
              alt={dappName}
              width={48}
              height={48}
              className="rounded-full"
              unoptimized
            />
          )}
          <div className="flex flex-col flex-1">
            <h2 className="text-lg font-bold capitalize">
              {dappData?.name || dappName}
            </h2>
            <span className="text-xs text-neutral-600">
              DApp Protocol
            </span>
          </div>
        </div>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
            </div>
          ) : dappData ? (
            <>
              {/* Basic Info */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
                  <span className="text-sm text-neutral-600">Status</span>
                  <span className="text-sm font-semibold text-green-600">Active</span>
                </div>

                {dappData.website && (
                  <a
                    href={dappData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-blue-900">
                      Visit Official Website
                    </span>
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </a>
                )}
              </div>

              {/* Protocol Info */}
              {/* <div className="pt-3 border-t">
                <p className="text-xs text-neutral-500 mb-2">Protocol Details</p>
                <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-neutral-600">Protocol ID</span>
                    <span className="text-xs font-mono text-neutral-700 truncate">
                      {dappData.dappId}
                    </span>
                  </div>
                </div>
              </div> */}

              {/* Note about data */}
              <div className="pt-3 border-t">
                <p className="text-xs text-neutral-500 text-center">
                  ℹ️ Additional metrics (TVL, users, chains) available through detailed analysis
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p className="text-sm">No protocol data available</p>
              <p className="text-xs mt-1">
                Protocol not found or data is loading...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
