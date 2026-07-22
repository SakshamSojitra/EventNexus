import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronRight, FiChevronLeft, FiZap, FiUpload, FiCheck, 
  FiAlertCircle, FiClock, FiDollarSign, FiUsers, FiImage,
  FiMapPin, FiCalendar, FiType, FiAlignLeft, FiGrid,
  FiLoader, FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useStore } from '../store/useStore';

// ---- Step Labels ----
const STEPS = [
  { label: 'Event Details', icon: FiType },
  { label: 'Schedule and Venue', icon: FiCalendar },
  { label: 'Tickets and Capacity', icon: FiDollarSign },
  { label: 'Media and Publish', icon: FiImage },
];

// ---- Form Interface ----
interface EventFormData {
  title: string;
  description: string;
  category: string;
  tags: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  ticketType: string;
  ticketPrice: string;
  ticketQuantity: string;
  capacity: string;
  bannerUrl: string;
  organizerName: string;
  organizerContact: string;
}

const initialFormData: EventFormData = {
  title: '', description: '', category: 'technology', tags: '',
  venueName: '', venueAddress: '', venueCity: '',
  startDate: '', endDate: '', startTime: '09:00', endTime: '17:00',
  ticketType: 'free', ticketPrice: '0', ticketQuantity: '100', capacity: '500',
  bannerUrl: '', organizerName: '', organizerContact: '',
};

// ---- Validation ----
interface ValidationErrors {
  [key: string]: string;
}

// ---- Form Field Component (defined OUTSIDE CreateEvent to prevent remount on every render) ----
const FormField = ({
  label, icon: Icon, error, children
}: {
  label: string;
  icon?: React.ComponentType<any>;
  error?: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block', fontWeight: 500 }}>
      {Icon && <Icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
      {label}
    </label>
    {children}
    {error && (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <FiAlertCircle size={12} /> {error}
      </motion.div>
    )}
  </div>
);

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // ---- Update Form Field ----
  const updateField = useCallback(<K extends keyof EventFormData>(
    field: K, value: EventFormData[K]
  ) => {
    console.log('[CreateEvent] Updating ' + field + ':', value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  // ---- Validate Current Step ----
  const validateStep = useCallback((stepNum: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (stepNum === 1) {
      if (!formData.title.trim()) newErrors.title = 'Event title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }
    
    if (stepNum === 2) {
      if (!formData.venueName.trim()) newErrors.venueName = 'Venue name is required';
      if (!formData.venueCity.trim()) newErrors.venueCity = 'City is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (stepNum === 3) {
      const qty = parseInt(formData.ticketQuantity);
      const price = parseFloat(formData.ticketPrice);
      if (formData.ticketType !== 'free' && (isNaN(price) || price < 0)) {
        newErrors.ticketPrice = 'Valid price is required';
      }
      if (isNaN(qty) || qty < 1) newErrors.ticketQuantity = 'Minimum 1 ticket';
      if (isNaN(parseInt(formData.capacity)) || parseInt(formData.capacity) < 1) {
        newErrors.capacity = 'Minimum capacity is 1';
      }
    }
    
    if (stepNum === 4) {
      if (!formData.organizerName.trim()) newErrors.organizerName = 'Organizer name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ---- Next Step ----
  const goNext = useCallback(() => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fix the highlighted fields');
    }
  }, [step, validateStep]);

  // ---- Previous Step ----
  const goBack = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  // ---- AI Generate ----
  const handleAIGenerate = useCallback(async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter an event title first');
      return;
    }
    setIsAILoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const aiDescription = 'Join us for an extraordinary ' + formData.title + ' experience! Featuring keynote speeches from industry leaders, hands-on workshops, networking opportunities, and the latest breakthroughs.';
      const aiTags = formData.title.toLowerCase().split(' ').join(', ') + ', technology, innovation';
      setFormData(prev => ({
        ...prev,
        description: prev.description || aiDescription,
        tags: prev.tags || aiTags,
        venueName: prev.venueName || 'San Francisco Convention Center',
        organizerName: prev.organizerName || 'Event Organizer',
      }));
      toast.success('AI content generated!');
    } catch (error) {
      toast.error('AI generation failed. Please try again.');
    } finally {
      setIsAILoading(false);
    }
  }, [formData]);

  // ---- Submit Event ----
  const handleSubmit = useCallback(async () => {
    if (!validateStep(4)) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to create events');
      navigate('/login');
      return;
    }
    if (user?.role !== 'organizer' && user?.role !== 'admin') {
      toast.error('Only organizers can create events');
      navigate('/dashboard');
      return;
    }
    
    setIsSubmitting(true);
    console.log('[CreateEvent] Submitting event...');
    
    try {
      const ticketName = formData.ticketType === 'free' 
        ? 'General Admission' 
        : formData.ticketType.charAt(0).toUpperCase() + formData.ticketType.slice(1) + ' Ticket';

      const eventPayload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        venue: {
          name: formData.venueName,
          address: formData.venueAddress,
          city: formData.venueCity,
        },
        dateTime: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
        tickets: [{
          type: formData.ticketType,
          name: ticketName,
          price: formData.ticketType === 'free' ? 0 : parseFloat(formData.ticketPrice),
          quantity: parseInt(formData.ticketQuantity),
          sold: 0,
        }],
        capacity: parseInt(formData.capacity),
        banner: formData.bannerUrl,
        status: 'published',
      };

      const { data } = await API.post('/events', eventPayload);
      toast.success('Event created successfully!');
      setFormData(initialFormData);
      setStep(1);
      if (data && data._id) {
        setTimeout(() => navigate('/event/' + data._id), 1500);
      }
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create event. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate, isAuthenticated, user, validateStep]);

  // ---- Render ----
  return (
    <section style={{ paddingTop: 100, minHeight: '100vh', paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
        
        {/* Auth Warning Banner */}
        {!isAuthenticated && (
          <div style={{
            padding: 12, marginBottom: 24,
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: '#F59E0B',
          }}>
            <FiAlertTriangle size={16} />
            You are not signed in. Please <a href="/login" style={{ color: '#F59E0B', fontWeight: 600, marginLeft: 4, marginRight: 4 }}>sign in</a> to save your event.
          </div>
        )}
        
        {isAuthenticated && user?.role !== 'organizer' && user?.role !== 'admin' && (
          <div style={{
            padding: 12, marginBottom: 24,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: '#ef4444',
          }}>
            <FiAlertTriangle size={16} />
            Only organizers can create events. <a href="/dashboard" style={{ color: '#ef4444', fontWeight: 600, marginLeft: 4 }}>Go to Dashboard</a>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={step}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <FiZap size={24} />
            </motion.div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
              Create Event
            </h1>
            <p style={{ fontSize: 14, color: '#a0a0b8' }}>
              Step {step} of 4 - {STEPS[step - 1].label}
            </p>
          </div>

          {/* Progress Steps */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isComplete = i + 1 < step;
              const isCurrent = i + 1 === step;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <motion.div
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: isComplete ? '#10B981' : isCurrent ? '#4F46E5' : 'rgba(255,255,255,0.08)',
                      border: isCurrent ? '2px solid rgba(79,70,229,0.4)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 600,
                    }}
                  >
                    {isComplete ? <FiCheck size={16} /> : <StepIcon size={16} />}
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      width: 60, height: 2,
                      background: isComplete ? '#10B981' : 'rgba(255,255,255,0.08)',
                      margin: '0 8px',
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Card */}
          <div style={{
            padding: 36, 
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 20, 
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
          }}>
            
            {/* AI Generate Button */}
            {step === 1 && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleAIGenerate}
                disabled={isAILoading}
                className="btn btn-accent"
                style={{ marginBottom: 28, width: '100%', padding: '14px', opacity: isAILoading ? 0.7 : 1 }}
              >
                {isAILoading ? (
                  <><FiLoader style={{ animation: 'rotate 1s linear infinite' }} /> Generating with AI...</>
                ) : (
                  <><FiZap /> Generate with AI</>
                )}
              </motion.button>
            )}

            <AnimatePresence mode="wait">
              {/* Step 1: Event Details */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FormField label="Event Title" icon={FiType} error={errors.title}>
                    <input type="text" value={formData.title} onChange={(e) => updateField('title', e.target.value)}
                      placeholder="e.g. React Conference 2027" className="input"
                      style={{ borderColor: errors.title ? '#ef4444' : undefined }} />
                  </FormField>
                  <FormField label="Description" icon={FiAlignLeft} error={errors.description}>
                    <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Describe what makes your event special..." className="input"
                      style={{ height: 130, borderColor: errors.description ? '#ef4444' : undefined }} />
                  </FormField>
                  <FormField label="Category" icon={FiGrid} error={errors.category}>
                    <select value={formData.category} onChange={(e) => updateField('category', e.target.value)}
                      className="input" style={{ borderColor: errors.category ? '#ef4444' : undefined }}>
                      {['technology', 'ai', 'startups', 'gaming', 'music', 'sports', 'business', 'design', 'marketing', 'finance'].map(c => (
                        <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Tags (comma separated)">
                    <input type="text" value={formData.tags} onChange={(e) => updateField('tags', e.target.value)}
                      placeholder="e.g. react, javascript" className="input" />
                  </FormField>
                </motion.div>
              )}

              {/* Step 2: Schedule & Venue */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FormField label="Venue Name" icon={FiMapPin} error={errors.venueName}>
                    <input type="text" value={formData.venueName} onChange={(e) => updateField('venueName', e.target.value)}
                      placeholder="e.g. Moscone Center" className="input" style={{ borderColor: errors.venueName ? '#ef4444' : undefined }} />
                  </FormField>
                  <FormField label="Venue Address">
                    <input type="text" value={formData.venueAddress} onChange={(e) => updateField('venueAddress', e.target.value)}
                      placeholder="Street address" className="input" />
                  </FormField>
                  <FormField label="City" error={errors.venueCity}>
                    <input type="text" value={formData.venueCity} onChange={(e) => updateField('venueCity', e.target.value)}
                      placeholder="e.g. San Francisco" className="input" style={{ borderColor: errors.venueCity ? '#ef4444' : undefined }} />
                  </FormField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <FormField label="Start Date" error={errors.startDate}>
                      <input type="date" value={formData.startDate} onChange={(e) => updateField('startDate', e.target.value)}
                        className="input" style={{ borderColor: errors.startDate ? '#ef4444' : undefined }} />
                    </FormField>
                    <FormField label="End Date" error={errors.endDate}>
                      <input type="date" value={formData.endDate} onChange={(e) => updateField('endDate', e.target.value)}
                        className="input" style={{ borderColor: errors.endDate ? '#ef4444' : undefined }} />
                    </FormField>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <FormField label="Start Time" icon={FiClock} error={errors.startTime}>
                      <input type="time" value={formData.startTime} onChange={(e) => updateField('startTime', e.target.value)} className="input" />
                    </FormField>
                    <FormField label="End Time" error={errors.endTime}>
                      <input type="time" value={formData.endTime} onChange={(e) => updateField('endTime', e.target.value)} className="input" />
                    </FormField>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Tickets & Capacity */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FormField label="Ticket Type" icon={FiDollarSign}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { value: 'free', label: 'Free' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'early_bird', label: 'Early Bird' },
                        { value: 'vip', label: 'VIP' },
                      ].map(t => (
                        <button key={t.value} onClick={() => { updateField('ticketType', t.value); if (t.value === 'free') updateField('ticketPrice', '0'); }}
                          style={{
                            flex: 1, padding: '10px 8px',
                            background: formData.ticketType === t.value ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.04)',
                            border: formData.ticketType === t.value ? '1px solid rgba(79,70,229,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 8, cursor: 'pointer',
                            color: formData.ticketType === t.value ? '#4F46E5' : '#a0a0b8',
                            fontSize: 12, fontWeight: 600,
                          }}
                        >{t.label}</button>
                      ))}
                    </div>
                  </FormField>
                  {formData.ticketType !== 'free' && (
                    <FormField label="Ticket Price (₹)" error={errors.ticketPrice}>
                      <input type="number" min="0" step="0.01" value={formData.ticketPrice} onChange={(e) => updateField('ticketPrice', e.target.value)}
                        placeholder="29.99" className="input" style={{ borderColor: errors.ticketPrice ? '#ef4444' : undefined }} />
                    </FormField>
                  )}
                  <FormField label="Tickets Available" icon={FiUsers} error={errors.ticketQuantity}>
                    <input type="number" min="1" value={formData.ticketQuantity} onChange={(e) => updateField('ticketQuantity', e.target.value)}
                      placeholder="100" className="input" style={{ borderColor: errors.ticketQuantity ? '#ef4444' : undefined }} />
                  </FormField>
                  <FormField label="Maximum Capacity" icon={FiUsers} error={errors.capacity}>
                    <input type="number" min="1" value={formData.capacity} onChange={(e) => updateField('capacity', e.target.value)}
                      placeholder="500" className="input" style={{ borderColor: errors.capacity ? '#ef4444' : undefined }} />
                  </FormField>
                </motion.div>
              )}

              {/* Step 4: Media & Publish */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FormField label="Event Banner URL (optional)" icon={FiImage}>
                    <input type="text" value={formData.bannerUrl} onChange={(e) => updateField('bannerUrl', e.target.value)}
                      placeholder="https://example.com/banner.jpg" className="input" />
                  </FormField>
                  <div style={{
                    padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                    border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', marginBottom: 20, cursor: 'pointer',
                  }}
                    onClick={() => {
                      updateField('bannerUrl', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop');
                      toast.success('Banner uploaded! (demo)');
                    }}
                  >
                    <FiUpload size={24} style={{ color: '#a0a0b8', marginBottom: 8 }} />
                    <div style={{ fontSize: 13, color: '#a0a0b8' }}>Click to upload a banner image (demo)</div>
                  </div>
                  <FormField label="Organizer Name" error={errors.organizerName}>
                    <input type="text" value={formData.organizerName} onChange={(e) => updateField('organizerName', e.target.value)}
                      placeholder="Your name or organization" className="input" style={{ borderColor: errors.organizerName ? '#ef4444' : undefined }} />
                  </FormField>
                  <FormField label="Organizer Contact (optional)">
                    <input type="text" value={formData.organizerContact} onChange={(e) => updateField('organizerContact', e.target.value)}
                      placeholder="Email or phone" className="input" />
                  </FormField>
                  <div style={{ padding: 20, background: 'rgba(79,70,229,0.05)', borderRadius: 12, border: '1px solid rgba(79,70,229,0.15)', marginTop: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#818cf8' }}>Event Summary</h4>
                    <div style={{ fontSize: 13, color: '#a0a0b8', lineHeight: 1.8 }}>
                      <strong style={{ color: '#c0c0d0' }}>{formData.title || 'No title'}</strong><br />
                      {formData.category} - {formData.venueName || 'TBD'}, {formData.venueCity || 'TBD'}<br />
                      {formData.startDate || 'TBD'} {formData.startTime || ''} to {formData.endTime || ''}<br />
                      {formData.ticketType === 'free' ? 'Free Entry' : `${formData.ticketPrice} per ticket`} - {formData.ticketQuantity} tickets
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={goBack} disabled={step === 1 || isSubmitting}
                className="btn btn-secondary" style={{ opacity: step === 1 ? 0.3 : 1, padding: '12px 24px' }}>
                <FiChevronLeft /> Back
              </button>
              {step < 4 ? (
                <button onClick={goNext} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                  Continue <FiChevronRight />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting}
                  className="btn btn-primary" style={{ padding: '12px 32px', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? (
                    <><FiLoader style={{ animation: 'rotate 1s linear infinite' }} /> Publishing...</>
                  ) : (
                    <><FiCheck /> Publish Event</>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CreateEvent;