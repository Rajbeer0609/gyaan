import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, UserCheck } from 'lucide-react';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomers({ search: search || undefined });
      if (res.data?.customers) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <span className="editorial-tag" style={{ marginBottom: '8px' }}>
          Patron Directory
        </span>
        <h1 style={{ fontSize: '2.2rem' }}>Registered Patrons</h1>
      </div>

      <div style={{ marginBottom: '24px', maxWidth: '380px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by patron name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
          style={{ paddingLeft: '40px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-muted)' }} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                <th style={{ padding: '16px' }}>Patron</th>
                <th style={{ padding: '16px' }}>Email</th>
                <th style={{ padding: '16px' }}>Phone</th>
                <th style={{ padding: '16px' }}>Membership Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>
                    {c.email}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                    {c.phone || 'Not provided'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase' }}>
                      Active Member
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
