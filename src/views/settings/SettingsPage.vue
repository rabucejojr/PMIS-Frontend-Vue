<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore, useSettingsStore } from '@/stores'
import { 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Lock,
  Save,
  Sun,
  Moon,
  Monitor
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import PageHeader from '@/components/shared/PageHeader.vue'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const activeTab = ref<'profile' | 'notifications' | 'appearance' | 'preferences' | 'security'>('profile')

// Profile form
const profileForm = ref({
  fullName: '',
  email: '',
  username: '',
  department: '',
  position: '',
  phone: ''
})

// Notification settings
const notifications = ref({ ...settingsStore.notificationSettings })

// Theme settings
const selectedTheme = ref(settingsStore.theme)

// Preferences
const preferences = ref({ ...settingsStore.userPreferences })

// Security
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: Globe },
  { id: 'security', label: 'Security', icon: Lock }
]

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

const saveProfile = () => {
  // TODO: Implement profile update API call
  alert('Profile updated successfully!')
}

const saveNotifications = () => {
  settingsStore.updateNotificationSettings(notifications.value)
  alert('Notification settings saved!')
}

const saveTheme = () => {
  settingsStore.updateTheme(selectedTheme.value)
  alert('Theme applied successfully!')
}

const savePreferences = () => {
  settingsStore.updateUserPreferences(preferences.value)
  alert('Preferences saved!')
}

const changePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Passwords do not match!')
    return
  }
  // TODO: Implement password change API call
  alert('Password changed successfully!')
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

onMounted(() => {
  settingsStore.loadSettings()
  
  // Load user profile data
  if (authStore.user) {
    profileForm.value = {
      fullName: authStore.user.username,
      email: authStore.user.email,
      username: authStore.user.username,
      department: authStore.user.department || '',
      position: authStore.user.role,
      phone: ''
    }
  }
})
</script>

<template>
  <div>
    <PageHeader
      title="Settings"
      description="Manage your account settings and preferences"
    />

    <div class="grid gap-6 md:grid-cols-[200px_1fr]">
      <!-- Sidebar Navigation -->
      <nav class="space-y-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id as any"
          :class="[
            'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
            activeTab === tab.id
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/50'
          ]"
        >
          <component :is="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </nav>

      <!-- Content Area -->
      <div class="space-y-6">
        <!-- Profile Settings -->
        <div v-if="activeTab === 'profile'">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="saveProfile" class="space-y-4">
                <div class="grid gap-4 md:grid-cols-2">
                  <div class="grid gap-2">
                    <Label for="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      v-model="profileForm.fullName"
                      placeholder="Juan Dela Cruz"
                    />
                  </div>

                  <div class="grid gap-2">
                    <Label for="username">Username</Label>
                    <Input
                      id="username"
                      v-model="profileForm.username"
                      placeholder="jdelacruz"
                    />
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    placeholder="juan@dost.gov.ph"
                  />
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <div class="grid gap-2">
                    <Label for="department">Department</Label>
                    <Input
                      id="department"
                      v-model="profileForm.department"
                      placeholder="IT Department"
                    />
                  </div>

                  <div class="grid gap-2">
                    <Label for="position">Position</Label>
                    <Input
                      id="position"
                      v-model="profileForm.position"
                      placeholder="Software Developer"
                    />
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label for="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    v-model="profileForm.phone"
                    type="tel"
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div class="flex justify-end">
                  <Button type="submit">
                    <Save class="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <!-- Notification Settings -->
        <div v-if="activeTab === 'notifications'">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p class="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch v-model:checked="notifications.email" />
                </div>

                <Separator />

                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p class="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch v-model:checked="notifications.push" />
                </div>

                <Separator />

                <div class="space-y-4">
                  <h4 class="text-sm font-medium">Notification Types</h4>
                  
                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label>Task Assigned</Label>
                      <p class="text-sm text-muted-foreground">When a task is assigned to you</p>
                    </div>
                    <Switch v-model:checked="notifications.taskAssigned" />
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label>Task Due</Label>
                      <p class="text-sm text-muted-foreground">Reminders for upcoming task deadlines</p>
                    </div>
                    <Switch v-model:checked="notifications.taskDue" />
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label>Project Updates</Label>
                      <p class="text-sm text-muted-foreground">Updates on projects you're involved in</p>
                    </div>
                    <Switch v-model:checked="notifications.projectUpdates" />
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label>Mentions</Label>
                      <p class="text-sm text-muted-foreground">When someone mentions you</p>
                    </div>
                    <Switch v-model:checked="notifications.mentions" />
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p class="text-sm text-muted-foreground">Weekly summary of your activity</p>
                    </div>
                    <Switch v-model:checked="notifications.weeklyDigest" />
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <Button @click="saveNotifications">
                  <Save class="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Appearance Settings -->
        <div v-if="activeTab === 'appearance'">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <Label>Theme</Label>
                <div class="grid grid-cols-3 gap-4">
                  <div
                    v-for="option in themeOptions"
                    :key="option.value"
                    @click="selectedTheme = option.value as any"
                    :class="[
                      'flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                      selectedTheme === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    ]"
                  >
                    <div :class="[
                      'rounded-lg p-3',
                      selectedTheme === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    ]">
                      <component :is="option.icon" class="h-6 w-6" />
                    </div>
                    <span class="text-sm font-medium">{{ option.label }}</span>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <Button @click="saveTheme">
                  <Save class="h-4 w-4 mr-2" />
                  Apply Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Preferences -->
        <div v-if="activeTab === 'preferences'">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your application preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="savePreferences" class="space-y-4">
                <div class="grid gap-4 md:grid-cols-2">
                  <div class="grid gap-2">
                    <Label for="language">Language</Label>
                    <Select v-model="preferences.language">
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fil">Filipino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="grid gap-2">
                    <Label for="timezone">Timezone</Label>
                    <Select v-model="preferences.timezone">
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Manila">Asia/Manila (PHT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label for="dateFormat">Date Format</Label>
                  <Select v-model="preferences.dateFormat">
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="flex justify-end">
                  <Button type="submit">
                    <Save class="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <!-- Security Settings -->
        <div v-if="activeTab === 'security'">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="changePassword" class="space-y-4">
                <div class="grid gap-2">
                  <Label for="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    type="password"
                    required
                  />
                </div>

                <div class="grid gap-2">
                  <Label for="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    type="password"
                    required
                  />
                </div>

                <div class="grid gap-2">
                  <Label for="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    required
                  />
                </div>

                <div class="flex justify-end">
                  <Button type="submit">
                    <Lock class="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>