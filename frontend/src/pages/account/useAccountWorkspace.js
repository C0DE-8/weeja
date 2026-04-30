import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchActiveCategories } from '../../api/categoryApi'
import { fetchUserProfile, updateUserProfile } from '../../api/userApi'
import { fetchWallets, fetchWalletTransactions } from '../../api/walletApi'
import { createUserPool, fetchUserPoolMeta, fetchUserPools } from '../../api/userPoolApi'
import { getStoredToken, setSession } from '../../api/session'

export const INITIAL_FORM = {
  title: '',
  description: '',
  category_id: '',
  currency_id: '',
  min_stake: '0',
  start_date: '',
  start_time: '',
  lock_date: '',
  lock_time: '',
  end_date: '',
  end_time: '',
  options: ['Yes', 'No'],
}

function joinDateTime(date, time) {
  if (!date || !time) return undefined
  return `${date}T${time}`
}

export function useAccountWorkspace() {
  const [profile, setProfile] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [feeSettings, setFeeSettings] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileMessage, setProfileMessage] = useState('')

  const loadWorkspace = useCallback(async () => {
    const [nextProfile, nextWallets, nextTransactions, categoryData, meta, nextSubmissions] =
      await Promise.all([
        fetchUserProfile(),
        fetchWallets(),
        fetchWalletTransactions(15),
        fetchActiveCategories(),
        fetchUserPoolMeta(),
        fetchUserPools(),
      ])

    setProfile(nextProfile)
    setProfileName(nextProfile.name || '')
    setSession({ token: getStoredToken(), user: nextProfile })
    setWallets(nextWallets)
    setTransactions(nextTransactions)
    setCategories(categoryData.categories || [])
    setCurrencies(meta.currencies || [])
    setFeeSettings(meta.fee_settings || [])
    setSubmissions(nextSubmissions)
    setForm((current) => ({
      ...current,
      category_id: current.category_id || String(categoryData.categories?.[0]?.id || ''),
      currency_id: current.currency_id || String(meta.currencies?.[0]?.id || ''),
    }))
  }, [])

  useEffect(() => {
    let active = true

    async function run() {
      try {
        await loadWorkspace()
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load your account.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    run()
    return () => {
      active = false
    }
  }, [loadWorkspace])

  const selectedFee = useMemo(
    () => feeSettings.find((setting) => String(setting.currency_id) === String(form.currency_id)),
    [feeSettings, form.currency_id],
  )

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileMessage('')
    setProfileLoading(true)

    try {
      const res = await updateUserProfile({ name: profileName.trim() })
      setProfile(res.user)
      setSession({ token: getStoredToken(), user: res.user })
      setProfileMessage('Profile updated.')
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : 'Could not update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleCreatePool = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitLoading(true)

    try {
      const cleanedOptions = form.options
        .map((option, index) => ({
          option_label: option.trim(),
          sort_order: index + 1,
        }))
        .filter((option) => option.option_label)

      await createUserPool({
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: Number(form.category_id),
        currency_id: Number(form.currency_id),
        min_stake: Number(form.min_stake || 0),
        start_time: joinDateTime(form.start_date, form.start_time),
        lock_time: joinDateTime(form.lock_date, form.lock_time),
        end_time: joinDateTime(form.end_date, form.end_time),
        options: cleanedOptions,
      })

      setSuccess('Pool submitted. The creation fee has been held pending admin review.')
      setForm({
        ...INITIAL_FORM,
        category_id: form.category_id,
        currency_id: form.currency_id,
      })
      await loadWorkspace()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your pool.')
    } finally {
      setSubmitLoading(false)
    }
  }

  return {
    profile,
    profileName,
    setProfileName,
    wallets,
    transactions,
    categories,
    currencies,
    feeSettings,
    submissions,
    form,
    setForm,
    loading,
    submitLoading,
    profileLoading,
    error,
    success,
    profileMessage,
    selectedFee,
    handleProfileSave,
    handleCreatePool,
  }
}
